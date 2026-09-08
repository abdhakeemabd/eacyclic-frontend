import Swal from 'sweetalert2';

// Base styling configuration to match the exact UX/UI requested
const baseConfig = {
  customClass: {
    popup: 'rounded-[24px] p-6 shadow-2xl border border-slate-100',
    title: 'font-[Poppins] font-bold text-[20px] leading-[19.6px] text-[#0D1B2A] mt-4',
    htmlContainer: 'font-[Poppins] font-normal text-[12px] leading-[20px] text-center text-[#585858] mt-3 mb-5',
    confirmButton: 'w-[117px] h-[33px] rounded-[7px] flex items-center justify-center mx-2 font-[Poppins] font-semibold text-[10.92px] leading-[16.38px] text-[#FFFFFF] transition-all duration-200 outline-none hover:opacity-90',
    cancelButton: 'bg-[#fff] text-[#454545] border border-[#777777] w-[117px] h-[33px] rounded-[7px] flex items-center justify-center mx-2 font-[Poppins] font-semibold text-[10.92px] leading-[16.38px] transition-all duration-200 outline-none hover:bg-gray-50',
    icon: 'border-0' // Clean up icon borders if any
  },
  buttonsStyling: false,
  returnFocus: false, // Fixes the aria-hidden focus warning
  didOpen: () => {
    // Force blur on the active element to prevent the aria-hidden console error
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }
};

export const showSuccess = (title, text, timer = 4000) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    iconColor: '#0AA249', // Success icon color
    title: title,
    text: text,
    timer: timer,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    customClass: {
      ...baseConfig.customClass,
      confirmButton: baseConfig.customClass.confirmButton + ' bg-[#0AA249]'
    }
  });
};

export const showError = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    iconColor: '#ef4444',
    title: title,
    text: text,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    customClass: {
      ...baseConfig.customClass,
      confirmButton: baseConfig.customClass.confirmButton + ' bg-[#ef4444]'
    }
  });
};

export const showConfirm = (title, text, confirmText = 'Confirm') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    iconColor: '#ef4444', // Red exclamation mark like the screenshot
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    customClass: {
      ...baseConfig.customClass,
      confirmButton: baseConfig.customClass.confirmButton + ' bg-[#0E8AF0]' // Send (Deactivate) button color
    }
  });
};

export const showWarning = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    iconColor: '#f59e0b',
    title: title,
    text: text,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    customClass: {
      ...baseConfig.customClass,
      confirmButton: baseConfig.customClass.confirmButton + ' bg-[#f59e0b]'
    }
  });
};
