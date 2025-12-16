'use client';

import { useState } from 'react';
import { SettingsExportImportModal } from './SettingsExportImportModal';
import { SettingsBackupRestore } from './SettingsBackupRestore';
import { SettingsVersioning } from './SettingsVersioning';
import { SettingsValidationRules } from './SettingsValidationRules';
import { Button } from '@/components/ui/button';

export function AdvancedSettingsTab() {
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'backup' | 'versioning' | 'validation' | 'export'
  >('backup');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">고급 설정 관리</h2>
          <p className="text-gray-600 mt-1">
            설정 내보내기/가져오기, 백업, 버전 관리, 검증 규칙 커스터마이징
          </p>
        </div>
        <Button
          onClick={() => setShowExportImportModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <i className="fas fa-file-export mr-2"></i>
          내보내기/가져오기
        </Button>
      </div>

      <div className="flex gap-2 border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeSection === 'backup'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveSection('backup')}
        >
          <i className="fas fa-database mr-2"></i>
          백업 및 복원
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeSection === 'versioning'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveSection('versioning')}
        >
          <i className="fas fa-code-branch mr-2"></i>
          버전 관리
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeSection === 'validation'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveSection('validation')}
        >
          <i className="fas fa-check-circle mr-2"></i>
          검증 규칙
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeSection === 'backup' && <SettingsBackupRestore />}
        {activeSection === 'versioning' && <SettingsVersioning />}
        {activeSection === 'validation' && <SettingsValidationRules />}
      </div>

      <SettingsExportImportModal
        open={showExportImportModal}
        onClose={() => setShowExportImportModal(false)}
        onSuccess={() => {
          // Reload if needed
        }}
      />
    </div>
  );
}

