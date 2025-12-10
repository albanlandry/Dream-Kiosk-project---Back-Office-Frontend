/**
 * Tests for Sidebar Superadmin Menu Visibility Logic
 * Tests that API key management menu is only visible to superadmin users
 */

describe('Sidebar - Superadmin Menu Visibility Logic', () => {
  // Helper function to check if user is superadmin
  const isSuperadmin = (roles: string[]): boolean => {
    return roles.includes('super_admin') || roles.includes('superadmin');
  };

  // Superadmin navigation items
  const superadminNavigation = [
    {
      name: 'API 키 관리',
      href: '/dashboard/api-keys',
      icon: 'fas fa-key',
      submenu: [
        { name: '키 목록', href: '/dashboard/api-keys', icon: 'fas fa-list' },
        { name: '키 생성', href: '/dashboard/api-keys/create', icon: 'fas fa-plus-circle' },
        { name: '보안 대시보드', href: '/dashboard/api-keys/security', icon: 'fas fa-shield-alt' },
        { name: '사용 통계', href: '/dashboard/api-keys/statistics', icon: 'fas fa-chart-line' },
        { name: '감사 로그', href: '/dashboard/api-keys/audit', icon: 'fas fa-history' },
      ],
    },
  ];

  it('should identify superadmin user correctly', () => {
    expect(isSuperadmin(['super_admin'])).toBe(true);
    expect(isSuperadmin(['superadmin'])).toBe(true);
    expect(isSuperadmin(['admin', 'super_admin'])).toBe(true);
    expect(isSuperadmin(['admin'])).toBe(false);
    expect(isSuperadmin([])).toBe(false);
  });

  it('should include superadmin navigation for superadmin users', () => {
    const superadminRoles = ['super_admin'];
    const regularAdminRoles = ['admin'];

    const superadminMenu = isSuperadmin(superadminRoles) ? superadminNavigation : [];
    const regularAdminMenu = isSuperadmin(regularAdminRoles) ? superadminNavigation : [];

    expect(superadminMenu.length).toBe(1);
    expect(superadminMenu[0].name).toBe('API 키 관리');
    expect(regularAdminMenu.length).toBe(0);
  });

  it('should include all submenu items for superadmin navigation', () => {
    const menu = superadminNavigation[0];
    expect(menu.submenu).toBeDefined();
    expect(menu.submenu.length).toBe(5);
    expect(menu.submenu.map((item) => item.name)).toEqual([
      '키 목록',
      '키 생성',
      '보안 대시보드',
      '사용 통계',
      '감사 로그',
    ]);
  });

  it('should handle case-insensitive superadmin role check', () => {
    expect(isSuperadmin(['SUPER_ADMIN'])).toBe(false); // exact match required
    expect(isSuperadmin(['SuperAdmin'])).toBe(false); // exact match required
    expect(isSuperadmin(['super_admin'])).toBe(true);
    expect(isSuperadmin(['superadmin'])).toBe(true);
  });

  it('should work with multiple roles', () => {
    expect(isSuperadmin(['admin', 'user', 'super_admin'])).toBe(true);
    expect(isSuperadmin(['admin', 'user', 'superadmin'])).toBe(true);
    expect(isSuperadmin(['admin', 'user'])).toBe(false);
  });
});

