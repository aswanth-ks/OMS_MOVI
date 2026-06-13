import Settings from '../../models/Settings.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * GET /api/admin/settings
 * Retrieves the global settings document. Creates it if it doesn't exist.
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    
    if (!settings) {
      settings = await Settings.create({ key: 'global' });
    }

    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/settings
 * Deep merges updates into the global settings document.
 */
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    let settings = await Settings.findOne({ key: 'global' });

    if (!settings) {
      settings = new Settings({ key: 'global' });
    }

    // Merge sections
    if (updates.general) settings.general = { ...settings.general, ...updates.general };
    if (updates.security) settings.security = { ...settings.security, ...updates.security };
    if (updates.notifications) settings.notifications = { ...settings.notifications, ...updates.notifications };
    if (updates.system) settings.system = { ...settings.system, ...updates.system };

    await settings.save();

    sendSuccess(res, settings, 'System settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/settings/reset
 * Resets settings to default values.
 */
export const resetSettings = async (req, res, next) => {
  try {
    await Settings.findOneAndDelete({ key: 'global' });
    const defaults = await Settings.create({ key: 'global' });
    
    sendSuccess(res, defaults, 'System settings reset to defaults');
  } catch (error) {
    next(error);
  }
};
