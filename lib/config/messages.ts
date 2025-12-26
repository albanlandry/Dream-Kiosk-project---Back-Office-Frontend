/**
 * Application Messages Dictionary
 * Centralized configuration for all user-facing messages and error messages
 */

export interface ErrorMessages {
  // API Errors
  api: {
    network: string;
    timeout: string;
    server: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    conflict: string;
    validation: string;
    unknown: string;
  };
  
  // API Keys
  apiKeys: {
    create: {
      success: string;
      failed: string;
      validation: string;
    };
    update: {
      success: string;
      failed: string;
      notFound: string;
      validation: string;
    };
    delete: {
      success: string;
      failed: string;
      notFound: string;
      confirm: string;
    };
    revoke: {
      success: string;
      failed: string;
    };
    blacklist: {
      success: string;
      failed: string;
    };
  };
  
  // Users
  users: {
    create: {
      success: string;
      failed: string;
      validation: string;
    };
    update: {
      success: string;
      failed: string;
      notFound: string;
    };
    delete: {
      success: string;
      failed: string;
      confirm: string;
    };
  };
  
  // Projects
  projects: {
    create: {
      success: string;
      failed: string;
    };
    update: {
      success: string;
      failed: string;
    };
    delete: {
      success: string;
      failed: string;
      confirm: string;
    };
  };
  
  // Content
  content: {
    create: {
      success: string;
      failed: string;
    };
    update: {
      success: string;
      failed: string;
    };
    delete: {
      success: string;
      failed: string;
      confirm: string;
    };
    download: {
      success: string;
      failed: string;
    };
  };
  
  // Activity Logs
  activityLogs: {
    export: {
      success: string;
      failed: string;
    };
    archive: {
      success: string;
      failed: string;
    };
    delete: {
      success: string;
      failed: string;
      confirm: string;
    };
  };
  
  // Common
  common: {
    loading: string;
    saving: string;
    deleting: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    close: string;
    retry: string;
  };
}

export const messages: ErrorMessages = {
  api: {
    network: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
    timeout: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
    server: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    unauthorized: '인증에 실패했습니다. 다시 로그인해주세요.',
    forbidden: '접근 권한이 없습니다.',
    notFound: '요청한 리소스를 찾을 수 없습니다.',
    conflict: '요청이 충돌했습니다. 데이터를 확인해주세요.',
    validation: '입력한 정보가 올바르지 않습니다. 다시 확인해주세요.',
    unknown: '알 수 없는 오류가 발생했습니다.',
  },
  
  apiKeys: {
    create: {
      success: 'API 키가 성공적으로 생성되었습니다.',
      failed: 'API 키 생성에 실패했습니다.',
      validation: 'API 키 정보를 올바르게 입력해주세요.',
    },
    update: {
      success: 'API 키가 성공적으로 업데이트되었습니다.',
      failed: 'API 키 업데이트에 실패했습니다.',
      notFound: 'API 키를 찾을 수 없습니다.',
      validation: '업데이트할 정보를 올바르게 입력해주세요.',
    },
    delete: {
      success: 'API 키가 성공적으로 삭제되었습니다.',
      failed: 'API 키 삭제에 실패했습니다.',
      notFound: '삭제할 API 키를 찾을 수 없습니다.',
      confirm: '이 API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
    revoke: {
      success: 'API 키가 성공적으로 취소되었습니다.',
      failed: 'API 키 취소에 실패했습니다.',
    },
    blacklist: {
      success: 'API 키가 블랙리스트에 추가되었습니다.',
      failed: 'API 키 블랙리스트 추가에 실패했습니다.',
    },
  },
  
  users: {
    create: {
      success: '사용자가 성공적으로 생성되었습니다.',
      failed: '사용자 생성에 실패했습니다.',
      validation: '사용자 정보를 올바르게 입력해주세요.',
    },
    update: {
      success: '사용자 정보가 성공적으로 업데이트되었습니다.',
      failed: '사용자 정보 업데이트에 실패했습니다.',
      notFound: '사용자를 찾을 수 없습니다.',
    },
    delete: {
      success: '사용자가 성공적으로 삭제되었습니다.',
      failed: '사용자 삭제에 실패했습니다.',
      confirm: '이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
  },
  
  projects: {
    create: {
      success: '프로젝트가 성공적으로 생성되었습니다.',
      failed: '프로젝트 생성에 실패했습니다.',
    },
    update: {
      success: '프로젝트가 성공적으로 업데이트되었습니다.',
      failed: '프로젝트 업데이트에 실패했습니다.',
    },
    delete: {
      success: '프로젝트가 성공적으로 삭제되었습니다.',
      failed: '프로젝트 삭제에 실패했습니다.',
      confirm: '이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
  },
  
  content: {
    create: {
      success: '콘텐츠가 성공적으로 생성되었습니다.',
      failed: '콘텐츠 생성에 실패했습니다.',
    },
    update: {
      success: '콘텐츠가 성공적으로 업데이트되었습니다.',
      failed: '콘텐츠 업데이트에 실패했습니다.',
    },
    delete: {
      success: '콘텐츠가 성공적으로 삭제되었습니다.',
      failed: '콘텐츠 삭제에 실패했습니다.',
      confirm: '이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
    download: {
      success: '다운로드가 시작되었습니다.',
      failed: '다운로드에 실패했습니다.',
    },
  },
  
  activityLogs: {
    export: {
      success: '활동 로그 내보내기가 완료되었습니다.',
      failed: '활동 로그 내보내기에 실패했습니다.',
    },
    archive: {
      success: '활동 로그가 성공적으로 아카이브되었습니다.',
      failed: '활동 로그 아카이브에 실패했습니다.',
    },
    delete: {
      success: '활동 로그가 성공적으로 삭제되었습니다.',
      failed: '활동 로그 삭제에 실패했습니다.',
      confirm: '선택한 활동 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
  },
  
  common: {
    loading: '로딩 중...',
    saving: '저장 중...',
    deleting: '삭제 중...',
    error: '오류',
    success: '성공',
    cancel: '취소',
    confirm: '확인',
    close: '닫기',
    retry: '다시 시도',
  },
};

/**
 * Get human-readable error message from API error
 */
export function getErrorMessage(error: any, defaultMessage?: string): string {
  if (!error) {
    return defaultMessage || messages.api.unknown;
  }

  // Handle Axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Try to get message from response data
    if (data?.message) {
      return data.message;
    }

    // Map status codes to messages
    switch (status) {
      case 400:
        return data?.error || messages.api.validation;
      case 401:
        return messages.api.unauthorized;
      case 403:
        return messages.api.forbidden;
      case 404:
        return messages.api.notFound;
      case 409:
        return messages.api.conflict;
      case 500:
      case 502:
      case 503:
        return messages.api.server;
      default:
        return data?.error || messages.api.unknown;
    }
  }

  // Handle network errors
  if (error.request) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return messages.api.timeout;
    }
    return messages.api.network;
  }

  // Handle other errors
  if (error.message) {
    return error.message;
  }

  return defaultMessage || messages.api.unknown;
}

