/**
 * Validation utilities for API key creation form
 */

export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return '이름은 필수입니다.';
  }
  if (name.length < 1) {
    return '이름은 최소 1자 이상이어야 합니다.';
  }
  if (name.length > 255) {
    return '이름은 최대 255자까지 가능합니다.';
  }
  if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(name)) {
    return '이름은 영문, 숫자, 공백, 하이픈, 언더스코어, 점만 사용할 수 있습니다.';
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (description && description.length > 1000) {
    return '설명은 최대 1000자까지 가능합니다.';
  }
  return null;
};

export const validateOwner = (owner: string): string | null => {
  if (!owner || owner.trim().length === 0) {
    return '소유자 이메일은 필수입니다.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(owner)) {
    return '유효한 이메일 주소를 입력하세요.';
  }
  if (owner.length > 255) {
    return '이메일은 최대 255자까지 가능합니다.';
  }
  return null;
};

export const validatePermissions = (
  paths: string[],
  methods: Record<string, string[]>,
): string | null => {
  if (paths.length === 0) {
    return '최소 하나의 API 경로를 선택해야 합니다.';
  }
  if (paths.length > 1000) {
    return '최대 1000개의 권한만 선택할 수 있습니다.';
  }

  for (const path of paths) {
    if (!path.startsWith('/api/v')) {
      return `경로는 /api/v로 시작해야 합니다: ${path}`;
    }
    if (path.length > 500) {
      return `경로가 너무 깁니다: ${path}`;
    }
    const pathMethods = methods[path] || [];
    if (pathMethods.length === 0) {
      return `경로에 최소 하나의 HTTP 메서드를 선택해야 합니다: ${path}`;
    }
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    for (const method of pathMethods) {
      if (!validMethods.includes(method.toUpperCase())) {
        return `유효하지 않은 HTTP 메서드: ${method}`;
      }
    }
  }
  return null;
};

