'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiKeysApi } from '@/lib/api/api-keys';

export interface EndpointNode {
  path: string;
  segment: string;
  methods: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    summary?: string;
    description?: string;
  }>;
  children: EndpointNode[];
  isParameter?: boolean;
  description?: string;
  tags?: string[];
}

export interface EndpointTree {
  root: EndpointNode;
  metadata: {
    totalEndpoints: number;
    lastScanned: string;
    version: string;
  };
}

interface EndpointTreeProps {
  selectedPaths: string[];
  selectedMethods: Record<string, string[]>;
  onSelectionChange: (paths: string[], methods: Record<string, string[]>) => void;
}

interface TreeNodeProps {
  node: EndpointNode;
  level: number;
  selectedPaths: string[];
  selectedMethods: Record<string, string[]>;
  onTogglePath: (path: string) => void;
  onToggleMethod: (path: string, method: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (path: string) => void;
  searchTerm: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
  HEAD: 'bg-gray-100 text-gray-800',
  OPTIONS: 'bg-purple-100 text-purple-800',
};

function TreeNode({
  node,
  level,
  selectedPaths,
  selectedMethods,
  onTogglePath,
  onToggleMethod,
  expandedNodes,
  onToggleExpand,
  searchTerm,
}: TreeNodeProps) {
  const isExpanded = expandedNodes.has(node.path);
  const isSelected = selectedPaths.includes(node.path);
  const hasChildren = node.children.length > 0;
  const hasMethods = node.methods.length > 0;
  const indent = level * 20;

  // Filter children and methods based on search
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return node.children;
    const term = searchTerm.toLowerCase();
    return node.children.filter(
      (child) =>
        child.path.toLowerCase().includes(term) ||
        child.segment.toLowerCase().includes(term) ||
        child.methods.some((m) => m.method.toLowerCase().includes(term)),
    );
  }, [node.children, searchTerm]);

  const filteredMethods = useMemo(() => {
    if (!searchTerm) return node.methods;
    const term = searchTerm.toLowerCase();
    return node.methods.filter(
      (m) =>
        m.method.toLowerCase().includes(term) ||
        node.path.toLowerCase().includes(term),
    );
  }, [node.methods, node.path, searchTerm]);

  // Show node if it matches search or has matching children
  const shouldShow = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      node.path.toLowerCase().includes(term) ||
      node.segment.toLowerCase().includes(term) ||
      filteredChildren.length > 0 ||
      filteredMethods.length > 0
    );
  }, [searchTerm, node.path, node.segment, filteredChildren.length, filteredMethods.length]);

  if (!shouldShow) return null;

  const nodeMethods = selectedMethods[node.path] || [];

  return (
    <div>
      <div
        className="flex items-center py-1 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${indent}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleExpand(node.path)}
            className="mr-1 p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        {/* Path Checkbox */}
        {(hasMethods || hasChildren) && (
          <label className="flex items-center cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onTogglePath(node.path)}
              className="mr-2 rounded"
            />
            <span
              className={`font-medium ${
                node.isParameter ? 'text-purple-600' : 'text-gray-900'
              }`}
            >
              {node.segment}
            </span>
            {node.isParameter && (
              <span className="ml-2 text-xs text-gray-500">(parameter)</span>
            )}
          </label>
        )}

        {/* Methods */}
        {hasMethods && (
          <div className="flex gap-1 flex-wrap">
            {filteredMethods.map((method) => {
              const isMethodSelected = nodeMethods.includes(method.method);
              return (
                <button
                  key={method.method}
                  type="button"
                  onClick={() => onToggleMethod(node.path, method.method)}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                    isMethodSelected
                      ? METHOD_COLORS[method.method] || 'bg-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={method.summary || method.description || method.method}
                >
                  {method.method}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {filteredChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedPaths={selectedPaths}
              selectedMethods={selectedMethods}
              onTogglePath={onTogglePath}
              onToggleMethod={onToggleMethod}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EndpointTree({
  selectedPaths,
  selectedMethods,
  onSelectionChange,
}: EndpointTreeProps) {
  const [tree, setTree] = useState<EndpointTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['/api/v1']));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async (refresh: boolean = false) => {
    try {
      setLoading(true);
      const treeData = await apiKeysApi.getEndpointTree(refresh);
      setTree(treeData);
      
      // Auto-expand root
      if (treeData?.root) {
        setExpandedNodes(new Set([treeData.root.path]));
      }
    } catch (error) {
      console.error('Failed to load endpoint tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePath = (path: string) => {
    const newPaths = selectedPaths.includes(path)
      ? selectedPaths.filter((p) => p !== path)
      : [...selectedPaths, path];

    // If deselecting, also remove methods
    const newMethods = { ...selectedMethods };
    if (!newPaths.includes(path)) {
      delete newMethods[path];
    } else if (!newMethods[path]) {
      // Auto-select all methods when path is selected
      const node = findNodeByPath(tree?.root, path);
      if (node && node.methods.length > 0) {
        newMethods[path] = node.methods.map((m) => m.method);
      }
    }

    onSelectionChange(newPaths, newMethods);
  };

  const handleToggleMethod = (path: string, method: string) => {
    const pathMethods = selectedMethods[path] || [];
    const newMethods = {
      ...selectedMethods,
      [path]: pathMethods.includes(method)
        ? pathMethods.filter((m) => m !== method)
        : [...pathMethods, method],
    };

    // Ensure path is in selectedPaths if method is selected
    const newPaths = newMethods[path].length > 0 && !selectedPaths.includes(path)
      ? [...selectedPaths, path]
      : selectedPaths;

    onSelectionChange(newPaths, newMethods);
  };

  const handleToggleExpand = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const findNodeByPath = (node: EndpointNode | undefined, targetPath: string): EndpointNode | null => {
    if (!node) return null;
    if (node.path === targetPath) return node;
    for (const child of node.children) {
      const found = findNodeByPath(child, targetPath);
      if (found) return found;
    }
    return null;
  };

  const handleSelectAll = () => {
    if (!tree?.root) return;
    const allPaths: string[] = [];
    const allMethods: Record<string, string[]> = {};

    const collectPaths = (node: EndpointNode) => {
      if (node.methods.length > 0) {
        allPaths.push(node.path);
        allMethods[node.path] = node.methods.map((m) => m.method);
      }
      node.children.forEach(collectPaths);
    };

    collectPaths(tree.root);
    onSelectionChange(allPaths, allMethods);
  };

  const handleClearAll = () => {
    onSelectionChange([], {});
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (!tree?.root) {
    return (
      <div className="p-8 text-center text-gray-500">
        엔드포인트 트리를 불러올 수 없습니다.
        <Button 
          type="button" 
          onClick={() => loadTree(false)} 
          className="mt-4" 
          variant="outline"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="엔드포인트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
          모두 선택
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleClearAll}>
          모두 해제
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => loadTree(true)}
          title="캐시를 무시하고 엔드포인트 트리를 새로고침합니다"
        >
          새로고침
        </Button>
      </div>

      {/* Tree */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-white">
        <TreeNode
          node={tree.root}
          level={0}
          selectedPaths={selectedPaths}
          selectedMethods={selectedMethods}
          onTogglePath={handleTogglePath}
          onToggleMethod={handleToggleMethod}
          expandedNodes={expandedNodes}
          onToggleExpand={handleToggleExpand}
          searchTerm={searchTerm}
        />
      </div>

      {/* Selected Summary */}
      {selectedPaths.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedPaths.length}개의 경로 선택됨
        </div>
      )}
    </div>
  );
}

