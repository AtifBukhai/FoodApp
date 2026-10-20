import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-kh-green-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-kh-orange rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">K</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">KhaanaDa</h3>
                <p className="text-xs text-green-300">{t('tagline')}</p>
              </div>
            </div>
            <p className="text-green-200 text-sm max-w-md leading-relaxed">
              {t('footerAbout')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full font-medium">
                🇵🇰 Pakistan
              </span>
              <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full font-medium">
                PKR Currency
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-green-300 mb-4">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li><Link to="/restaurants" className="text-sm text-green-200 hover:text-white transition-colors">{t('restaurants')}</Link></li>
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">{t('aboutUs')}</a></li>
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">{t('contactUs')}</a></li>
              <li><Link to="/partner" className="text-sm text-green-200 hover:text-white transition-colors">{t('becomePartner')}</Link></li>
              <li><Link to="/partner" className="text-sm text-green-200 hover:text-white transition-colors">{t('becomeRider')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-green-300 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">{t('termsOfService')}</a></li>
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-green-200 hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-green-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-green-300">
            © 2024 KhaanaDa. {t('allRightsReserved')}
          </p>
          <p className="text-xs text-green-400 bg-green-900/50 px-3 py-1 rounded-full">
            ⚠️ {t('devNote')}
          </p>
        </div>
      </div>
    </footer>
  );
}
