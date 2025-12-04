'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ title: '', content: '' });

  useEffect(() => {
    loadKnowledgeDocs();
  }, []);

  async function loadKnowledgeDocs() {
    try {
      // Fetch knowledge docs for the authenticated user's widgets
      const response = await fetch('/api/knowledge');

      if (!response.ok) {
        console.error('Error loading knowledge docs:', await response.text());
        return;
      }

      const knowledgeDocs = await response.json();
      setDocs(knowledgeDocs || []);
    } catch (error) {
      console.error('Error loading knowledge docs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setValidationErrors({ title: '', content: '' });

    // Client-side validation
    const errors = { title: '', content: '' };
    let hasErrors = false;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      hasErrors = true;
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters';
      hasErrors = true;
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
      hasErrors = true;
    } else if (formData.content.trim().length > 50000) {
      errors.content = 'Content must not exceed 50000 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Update existing doc
        const response = await fetch(`/api/knowledge/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            content: formData.content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update knowledge doc');
        }
      } else {
        // Create new doc
        const response = await fetch('/api/knowledge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            content: formData.content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create knowledge doc');
        }
      }

      // Reset form and reload
      setFormData({ title: '', content: '' });
      setIsAdding(false);
      setEditingId(null);
      await loadKnowledgeDocs();
    } catch (error) {
      console.error('Error saving knowledge doc:', error);
      alert('Failed to save knowledge document');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this knowledge document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge doc');
      }

      await loadKnowledgeDocs();
    } catch (error) {
      console.error('Error deleting knowledge doc:', error);
      alert('Failed to delete knowledge document');
    }
  }

  function startEdit(doc: KnowledgeDoc) {
    setEditingId(doc.id);
    setFormData({ title: doc.title, content: doc.content });
    setIsAdding(true);
  }

  function cancelEdit() {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', content: '' });
    setValidationErrors({ title: '', content: '' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-gray-600 mt-1">
            Add documents to help your AI provide better answers
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            + Add Document
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Document' : 'Add New Document'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setValidationErrors({ ...validationErrors, title: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Company Information, Product Features, FAQ"
                maxLength={200}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  setValidationErrors({ ...validationErrors, content: '' });
                }}
                rows={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                  validationErrors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter the knowledge content that the AI can use to answer questions..."
                maxLength={50000}
              />
              {validationErrors.content && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.content.length} / 50000 characters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Document' : 'Add Document'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Documents ({docs.length})
          </h3>
        </div>
        {docs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge documents yet</h3>
            <p className="text-gray-500 mb-4">
              Add documents to help your AI assistant provide better, more accurate answers.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Your First Document
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {docs.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 whitespace-pre-wrap">
                      {doc.content}
                    </p>
                    <div className="text-xs text-gray-500">
                      Created {new Date(doc.created_at).toLocaleDateString()} •
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(doc)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
