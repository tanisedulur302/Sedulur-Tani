import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      position: "top-right",
      duration: 3000,
    });
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      position: "top-right",
      duration: 4000,
    });
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      position: "top-right",
      duration: 3000,
    });
  },
  warning: (message: string) => {
    sonnerToast.warning(message, {
      position: "top-right",
      duration: 3000,
    });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: "top-right",
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      position: "top-right",
    });
  },
};
