const placeholder = /^(replace-with|change-me|your[-_])/i;

export function productionConfigurationErrors(env = process.env) {
  if (env.NODE_ENV !== 'production') return [];

  const errors = [];
  if (!env.MONGODB_URI || !/^mongodb(?:\+srv)?:\/\//i.test(env.MONGODB_URI)) {
    errors.push('MONGODB_URI must be set to a MongoDB connection string.');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || placeholder.test(env.JWT_SECRET)) {
    errors.push('JWT_SECRET must be a private random value with at least 32 characters.');
  }
  if (!env.CRON_SECRET || env.CRON_SECRET.length < 32 || placeholder.test(env.CRON_SECRET)) {
    errors.push('CRON_SECRET must be a private random value with at least 32 characters.');
  }
  if (!env.BREVO_API_KEY || placeholder.test(env.BREVO_API_KEY)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.BREVO_SENDER_EMAIL || '')) {
    errors.push('BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured.');
  }

  const origins = (env.CLIENT_URL || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (!origins.length || origins.some((value) => {
    try {
      const url = new URL(value);
      return url.protocol !== 'https:' || url.origin !== value.replace(/\/$/, '');
    } catch {
      return true;
    }
  })) {
    errors.push('CLIENT_URL must contain only explicit HTTPS origins.');
  }
  return errors;
}

export function assertProductionConfiguration(env = process.env) {
  const errors = productionConfigurationErrors(env);
  if (errors.length) throw new Error(`Invalid production configuration: ${errors.join(' ')}`);
}

