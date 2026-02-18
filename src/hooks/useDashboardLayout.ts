/**
 * useDashboardLayout Hook
 *
 * Manages dashboard layout state with persistence.
 * Features:
 * - Load/save layout to localStorage
 * - Supabase sync (optional)
 * - Widget visibility toggle
 * - Widget position/size updates
 * - Reset to default layout
 */

import { useState, useEffect, useCallback } from 'react';
import { WidgetLayout, DEFAULT_LAYOUT } from '../config/widgetRegistry';
import logger from '../utils/logger';

interface DashboardLayoutData {
  widgets: WidgetLayout[];
  updatedAt: string;
}

const STORAGE_KEY = 'dashboard-layout';

export function useDashboardLayout() {
  const [layout, setLayout] = useState<WidgetLayout[]>(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  /**
   * Load layout from localStorage on mount
   */
  useEffect(() => {
    loadLayout();
  }, []);

  /**
   * Load layout from storage
   */
  const loadLayout = async () => {
    setLoading(true);

    try {
      // Load from localStorage (instant)
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: DashboardLayoutData = JSON.parse(stored);

        // Validate layout structure
        if (Array.isArray(parsed.widgets) && parsed.widgets.length > 0) {
          logger.info('[useDashboardLayout] Loaded from localStorage:', parsed.widgets.length, 'widgets');
          setLayout(parsed.widgets);
          setLastSaved(new Date(parsed.updatedAt));
          return;
        }
      }

      // If no valid layout found, use default
      logger.info('[useDashboardLayout] Using default layout');
      setLayout(DEFAULT_LAYOUT);

      // TODO: Load from Supabase for cross-device sync
      // const { data, error } = await supabase
      //   .from('user_preferences')
      //   .select('dashboard_layout')
      //   .eq('user_id', currentUserId)
      //   .single();
      //
      // if (!error && data?.dashboard_layout) {
      //   setLayout(data.dashboard_layout.widgets);
      //   setLastSaved(new Date(data.dashboard_layout.updatedAt));
      // }

    } catch (err) {
      logger.error('[useDashboardLayout] Load error:', err);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save layout to storage
   */
  const saveLayout = useCallback(async (newLayout: WidgetLayout[]) => {
    setSaving(true);

    try {
      const now = new Date();
      const layoutData: DashboardLayoutData = {
        widgets: newLayout,
        updatedAt: now.toISOString()
      };

      // Save to localStorage (instant)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutData));
      logger.info('[useDashboardLayout] Saved to localStorage');

      setLayout(newLayout);
      setLastSaved(now);

      // TODO: Save to Supabase for persistence
      // await supabase
      //   .from('user_preferences')
      //   .upsert({
      //     user_id: currentUserId,
      //     dashboard_layout: layoutData,
      //     updated_at: now.toISOString()
      //   });

    } catch (err) {
      logger.error('[useDashboardLayout] Save error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Update single widget
   */
  const updateWidget = useCallback((id: string, updates: Partial<WidgetLayout>) => {
    setLayout(prev => {
      const newLayout = prev.map(widget =>
        widget.id === id ? { ...widget, ...updates } : widget
      );
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  /**
   * Toggle widget visibility
   */
  const toggleWidget = useCallback((id: string) => {
    setLayout(prev => {
      const widget = prev.find(w => w.id === id);
      if (!widget) return prev;

      const newLayout = prev.map(w =>
        w.id === id ? { ...w, visible: !w.visible } : w
      );
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  /**
   * Add widget to layout
   */
  const addWidget = useCallback((id: string, position?: { x: number; y: number }) => {
    setLayout(prev => {
      // Check if widget already exists
      const exists = prev.find(w => w.id === id);
      if (exists) {
        // Just make it visible
        return prev.map(w =>
          w.id === id ? { ...w, visible: true } : w
        );
      }

      // Add new widget
      const newWidget: WidgetLayout = {
        id,
        x: position?.x ?? 0,
        y: position?.y ?? 0,
        w: 6,
        h: 2,
        visible: true
      };

      const newLayout = [...prev, newWidget];
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  /**
   * Remove widget from layout
   */
  const removeWidget = useCallback((id: string) => {
    setLayout(prev => {
      const newLayout = prev.filter(w => w.id !== id);
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  /**
   * Reset to default layout
   */
  const resetLayout = useCallback(() => {
    logger.info('[useDashboardLayout] Resetting to default layout');
    saveLayout(DEFAULT_LAYOUT);
  }, [saveLayout]);

  /**
   * Get visible widgets
   */
  const visibleWidgets = layout.filter(w => w.visible);

  /**
   * Get widget by ID
   */
  const getWidget = useCallback((id: string) => {
    return layout.find(w => w.id === id);
  }, [layout]);

  return {
    layout,
    visibleWidgets,
    loading,
    saving,
    lastSaved,
    saveLayout,
    updateWidget,
    toggleWidget,
    addWidget,
    removeWidget,
    resetLayout,
    getWidget
  };
}

export default useDashboardLayout;
