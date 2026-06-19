import Settings from '../../models/Settings.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const SECTIONS = ['general', 'security', 'notifications', 'branding', 'data', 'system'];

// Recursive merge — handles nested objects like twoFactorMethods without wiping them
const deepMerge = (target = {}, source = {}) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) settings = await Settings.create({ key: 'global' });
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) settings = new Settings({ key: 'global' });

    for (const section of SECTIONS) {
      if (updates[section]) {
        const existing = settings[section]?.toObject ? settings[section].toObject() : (settings[section] || {});
        settings[section] = deepMerge(existing, updates[section]);
      }
    }

    settings.markModified('security');
    settings.markModified('notifications');
    settings.markModified('branding');
    settings.markModified('data');
    await settings.save();

    sendSuccess(res, settings, 'Settings saved successfully');
  } catch (error) {
    next(error);
  }
};

export const resetSettings = async (req, res, next) => {
  try {
    await Settings.findOneAndDelete({ key: 'global' });
    const defaults = await Settings.create({ key: 'global' });
    sendSuccess(res, defaults, 'Settings reset to defaults');
  } catch (error) {
    next(error);
  }
};
