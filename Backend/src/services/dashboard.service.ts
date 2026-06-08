import prisma from "../database/prisma";

class DashboardService {
  async getSellerStatistics(sellerId: string) {
    // Get all products for this seller
    const products = await prisma.product.findMany({
      where: { seller_id: sellerId }
    });

    const productIds = products.map(p => p.id);

    // Get all orders for seller's products
    const orders = await prisma.order.findMany({
      where: {
        product_id: { in: productIds }
      },
      include: {
        product: true,
        checkout: true
      }
    });

    // Calculate total revenue (only completed and shipped orders)
    const totalRevenue = orders
      .filter(o => ['completed', 'shipped', 'processed'].includes(o.status))
      .reduce((sum, order) => sum + order.total_price, 0);

    // Group orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      processed: orders.filter(o => o.status === 'processed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Get sales data for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const salesByDay = await this.getSalesByDay(productIds, sevenDaysAgo);

    // Get top selling products
    const topProducts = await this.getTopProducts(productIds);

    // Get low stock products (< 10)
    const lowStockProducts = products.filter(p => p.stock < 10).map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock
    }));

    // Get monthly revenue trend (last 6 months)
    const monthlyRevenue = await this.getMonthlyRevenue(productIds);

    // Calculate growth rate (compare this month vs last month)
    const growthRate = await this.calculateGrowthRate(productIds);

    return {
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        growthRate
      },
      ordersByStatus,
      salesByDay,
      topProducts,
      lowStockProducts,
      monthlyRevenue,
      recentOrders: orders.slice(0, 10).map(order => ({
        id: order.id,
        productName: order.product.name,
        quantity: order.quantity,
        totalPrice: order.total_price,
        status: order.status,
        createdAt: order.created_at
      }))
    };
  }

  async getAdminStatistics() {
    // Get overall platform statistics
    const totalUsers = await prisma.user.count();
    const totalBuyers = await prisma.user.count({ where: { role: 'buyer' } });
    const totalSellers = await prisma.user.count({ where: { role: 'seller' } });
    const totalProducts = await prisma.product.count();
    
    // Get all orders
    const allOrders = await prisma.order.findMany({
      include: {
        product: {
          include: {
            seller: true
          }
        },
        user: true
      }
    });

    // Calculate total platform revenue
    const totalRevenue = allOrders
      .filter(o => ['completed', 'shipped', 'processed'].includes(o.status))
      .reduce((sum, order) => sum + order.total_price, 0);

    // Group orders by status
    const ordersByStatus = {
      pending: allOrders.filter(o => o.status === 'pending').length,
      processed: allOrders.filter(o => o.status === 'processed').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    };

    // Get sales for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailySales = await this.getDailySalesForAdmin(thirtyDaysAgo);

    // Get top selling categories
    const topCategories = await this.getTopCategories();

    // Get top sellers
    const topSellers = await this.getTopSellers(allOrders);

    // Get monthly revenue trend (last 12 months) for admin
    const monthlyRevenue = await this.getMonthlyRevenueAdmin();

    // User registration trend (last 7 days)
    const userGrowth = await this.getUserGrowth();

    // Product categories distribution
    const categoryDistribution = await this.getCategoryDistribution();

    // --- New Real Data Implementation ---

    // 1. Quick Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: { created_at: { gte: today } }
    });
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total_price, 0);
    
    const newUsersToday = await prisma.user.count({
      where: { created_at: { gte: today } }
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { status: 'pending' }
    });

    const lowStockCount = await prisma.product.count({
      where: { stock: { lt: 10 } }
    });

    const quickStats = {
      todaySales,
      newUsers: newUsersToday,
      pendingOrders: pendingOrdersCount,
      lowStock: lowStockCount
    };

    // 2. Notifications
    const notifications: any[] = [];
    
    // New Orders Notification
    const recentPendingOrders = await prisma.order.findMany({
      where: { status: 'pending' },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { user: true }
    });

    recentPendingOrders.forEach(order => {
      notifications.push({
        id: `ord-${order.id}`,
        type: 'order',
        message: `Pesanan baru #${order.id.substring(0,8)} dari ${order.user.name}`,
        time: order.created_at,
        status: 'new',
        priority: 'high'
      });
    });

    // Low Stock Notification
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 5,
      orderBy: { stock: 'asc' }
    });

    lowStockProducts.forEach(product => {
      notifications.push({
        id: `prod-${product.id}`,
        type: 'product',
        message: `Stok ${product.name} menipis (${product.stock} left)`,
        time: new Date(), // Current time for alert
        status: 'warning',
        priority: 'medium'
      });
    });

    // New Users Notification
    const recentNewUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { created_at: 'desc' }
    });

    recentNewUsers.forEach(user => {
      notifications.push({
        id: `user-${user.id}`,
        type: 'user',
        message: `Pengguna baru ${user.name} bergabung`,
        time: user.created_at,
        status: 'info',
        priority: 'low'
      });
    });

    const sortedNotifications = notifications
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

    // 3. Recent Activities
    const activities: any[] = [];

    // Recent Orders Activity
    const recentActivityOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { user: true, product: true }
    });

    recentActivityOrders.forEach(order => {
      activities.push({
        id: `act-ord-${order.id}`,
        user: order.user.name,
        action: 'Membeli',
        target: order.product.name,
        time: order.created_at,
        type: 'purchase'
      });
    });

    // Recent Products Activity
    const recentActivityProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { seller: true }
    });

    recentActivityProducts.forEach(product => {
      activities.push({
        id: `act-prod-${product.id}`,
        user: product.seller.name,
        action: 'Menambah produk baru',
        target: product.name,
        time: product.created_at,
        type: 'create'
      });
    });

    // Recent User Registrations
    recentNewUsers.forEach(user => {
       activities.push({
        id: `act-user-${user.id}`,
        user: user.name,
        action: 'Mendaftar sebagai',
        target: user.role === 'seller' ? 'Penjual' : 'Pembeli',
        time: user.created_at,
        type: 'register'
      });
    });

    const recentActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return {
      summary: {
        totalRevenue,
        totalOrders: allOrders.length,
        totalProducts,
        totalUsers,
        totalBuyers,
        totalSellers,
        averageOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0
      },
      quickStats,
      notifications: sortedNotifications,
      recentActivities,
      ordersByStatus,
      dailySales,
      topCategories,
      topSellers,
      monthlyRevenue,
      userGrowth,
      categoryDistribution,
      recentOrders: allOrders.slice(0, 10).map(order => ({
        id: order.id,
        buyerName: order.user.name,
        productName: order.product.name,
        sellerName: order.product.seller.name,
        quantity: order.quantity,
        totalPrice: order.total_price,
        status: order.status,
        createdAt: order.created_at
      }))
    };
  }

  private async getSalesByDay(productIds: string[], fromDate: Date) {
    const sales = await prisma.order.groupBy({
      by: ['created_at'],
      where: {
        product_id: { in: productIds },
        created_at: { gte: fromDate },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      _sum: {
        total_price: true,
        quantity: true
      }
    });

    // Format data for chart
    const dailySales: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySale = sales.find(s => 
        new Date(s.created_at).toISOString().split('T')[0] === dateStr
      );

      dailySales.push({
        date: dateStr,
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue: daySale?._sum.total_price || 0,
        orders: daySale?._sum.quantity || 0
      });
    }

    return dailySales;
  }

  private async getTopProducts(productIds: string[]) {
    const topProducts = await prisma.order.groupBy({
      by: ['product_id'],
      where: {
        product_id: { in: productIds },
        status: { notIn: ['cancelled'] }
      },
      _sum: {
        quantity: true,
        total_price: true
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details
    const productDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.product_id }
        });
        return {
          id: tp.product_id,
          name: product?.name || 'Unknown',
          totalSold: tp._sum.quantity || 0,
          totalRevenue: tp._sum.total_price || 0,
          orderCount: tp._count
        };
      })
    );

    return productDetails;
  }

  private async getMonthlyRevenue(productIds: string[]) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: {
        product_id: { in: productIds },
        created_at: { gte: sixMonthsAgo },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      select: {
        total_price: true,
        created_at: true
      }
    });

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const monthYear = new Date(order.created_at).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + order.total_price;
    });

    // Format for chart
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      result.push({
        month: monthYear,
        revenue: monthlyData[monthYear] || 0
      });
    }

    return result;
  }

  private async calculateGrowthRate(productIds: string[]) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRevenue = await prisma.order.aggregate({
      where: {
        product_id: { in: productIds },
        created_at: { gte: thisMonthStart },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      _sum: {
        total_price: true
      }
    });

    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        product_id: { in: productIds },
        created_at: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      _sum: {
        total_price: true
      }
    });

    const thisMonth = thisMonthRevenue._sum.total_price || 0;
    const lastMonth = lastMonthRevenue._sum.total_price || 0;

    if (lastMonth === 0) return 0;

    return ((thisMonth - lastMonth) / lastMonth) * 100;
  }

  private async getDailySalesForAdmin(fromDate: Date) {
    const sales = await prisma.order.groupBy({
      by: ['created_at'],
      where: {
        created_at: { gte: fromDate },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      _sum: {
        total_price: true
      },
      _count: true
    });

    // Format data for 30 days
    const dailySales: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySale = sales.find(s => 
        new Date(s.created_at).toISOString().split('T')[0] === dateStr
      );

      dailySales.push({
        date: dateStr,
        day: date.getDate(),
        revenue: daySale?._sum.total_price || 0,
        orders: daySale?._count || 0
      });
    }

    return dailySales;
  }

  private async getTopCategories() {
    const categories = await prisma.category.findMany();
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        // Since category in Product is a string field, we match by name
        const products = await prisma.product.findMany({
          where: { category: category.name }
        });
        
        const productIds = products.map(p => p.id);
        
        const orders = await prisma.order.findMany({
          where: {
            product_id: { in: productIds },
            status: { notIn: ['cancelled'] }
          }
        });
        
        const totalRevenue = orders.reduce((sum, order) => 
          sum + order.total_price, 0
        );
        
        return {
          id: category.id,
          name: category.name,
          totalRevenue,
          totalOrders: orders.length,
          productCount: products.length
        };
      })
    );

    return categoryStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }

  private async getTopSellers(allOrders: any[]) {
    const sellerRevenue: { [key: string]: { name: string, revenue: number, orderCount: number } } = {};

    allOrders
      .filter(o => ['completed', 'shipped', 'processed'].includes(o.status))
      .forEach(order => {
        const sellerId = order.product.seller_id;
        const sellerName = order.product.seller.name;

        if (!sellerRevenue[sellerId]) {
          sellerRevenue[sellerId] = {
            name: sellerName,
            revenue: 0,
            orderCount: 0
          };
        }

        sellerRevenue[sellerId].revenue += order.total_price;
        sellerRevenue[sellerId].orderCount += 1;
      });

    return Object.entries(sellerRevenue)
      .map(([id, data]) => ({
        id,
        name: data.name,
        revenue: data.revenue,
        orderCount: data.orderCount
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private async getMonthlyRevenueAdmin() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const orders = await prisma.order.findMany({
      where: {
        created_at: { gte: twelveMonthsAgo },
        status: { in: ['completed', 'shipped', 'processed'] }
      },
      select: {
        total_price: true,
        created_at: true
      }
    });

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const monthYear = new Date(order.created_at).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + order.total_price;
    });

    // Format for chart
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      result.push({
        month: monthYear,
        revenue: monthlyData[monthYear] || 0
      });
    }

    return result;
  }

  private async getUserGrowth() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await prisma.user.groupBy({
      by: ['created_at', 'role'],
      where: {
        created_at: { gte: sevenDaysAgo }
      },
      _count: true
    });

    // Format data for chart
    const dailyGrowth: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUsers = users.filter(u => 
        new Date(u.created_at).toISOString().split('T')[0] === dateStr
      );

      const buyers = dayUsers.find(u => u.role === 'buyer')?._count || 0;
      const sellers = dayUsers.find(u => u.role === 'seller')?._count || 0;

      dailyGrowth.push({
        date: dateStr,
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        buyers,
        sellers,
        total: buyers + sellers
      });
    }

    return dailyGrowth;
  }

  private async getCategoryDistribution() {
    const categories = await prisma.category.findMany();
    
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        // Since category in Product is a string field, we match by name
        const productCount = await prisma.product.count({
          where: { category: category.name }
        });
        
        return {
          name: category.name,
          value: productCount,
          percentage: 0 // Will be calculated in frontend
        };
      })
    );

    return categoryData;
  }
}

export default new DashboardService();
