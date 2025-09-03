
import EmailNotificationSettings from './EmailNotificationSettings';
import SettingsDashboard from './settings/SettingsDashboard';
import BrandingSettings from './settings/BrandingSettings';
import BusinessSettings from './settings/BusinessSettings';
import PaymentSettings from './settings/PaymentSettings';
import NotificationSettings from './settings/NotificationSettings';
import { DepositSettingsManager } from './DepositSettingsManager';
import { PaymentAnalytics } from './PaymentAnalytics';

interface SettingsViewProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const SettingsView = ({ currentView, onViewChange }: SettingsViewProps) => {
  const renderSettingsContent = () => {
    switch (currentView) {
      case 'branding-settings':
        return <BrandingSettings />;
      case 'business-settings':
        return <BusinessSettings />;
      case 'payment-settings':
        return <PaymentSettings />;
      case 'deposit-settings':
        return <DepositSettingsManager />;
      case 'payment-analytics':
        return <PaymentAnalytics />;
      case 'notification-settings':
        return <NotificationSettings />;
      case 'email-settings':
        return <EmailNotificationSettings />;
      case 'settings':
      default:
        return <SettingsDashboard onNavigate={onViewChange} />;
    }
  };

  return renderSettingsContent();
};

export default SettingsView;
