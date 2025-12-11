'use client';

import { EndpointTree } from './EndpointTree';
import { AlertCircle } from 'lucide-react';

interface PermissionsSectionProps {
  selectedPaths: string[];
  selectedMethods: Record<string, string[]>;
  onPermissionsChange: (paths: string[], methods: Record<string, string[]>) => void;
  error?: string;
  touched?: boolean;
}

export function PermissionsSection({
  selectedPaths,
  selectedMethods,
  onPermissionsChange,
  error,
  touched,
}: PermissionsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">권한 설정</h3>
      <p className="text-sm text-gray-600">
        아래 트리에서 접근을 허용할 API 엔드포인트를 선택하세요.
      </p>
      <div className={error && touched ? 'border-2 border-red-500 rounded-lg p-2' : ''}>
        <EndpointTree
          selectedPaths={selectedPaths}
          selectedMethods={selectedMethods}
          onSelectionChange={onPermissionsChange}
        />
      </div>
      {error && touched && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Selected Permissions Summary */}
      {selectedPaths.length > 0 && (
        <div className="mt-4 rounded border p-4 bg-gray-50">
          <h4 className="mb-2 text-sm font-semibold">선택된 권한 ({selectedPaths.length}개)</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selectedPaths.map((path) => (
              <div key={path} className="text-sm">
                <span className="font-mono text-gray-700">{path}</span>
                {selectedMethods[path] && selectedMethods[path].length > 0 && (
                  <span className="ml-2 text-gray-500">
                    [{selectedMethods[path].join(', ')}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

