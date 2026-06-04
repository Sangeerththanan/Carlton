import { SignupForm } from '../components/SignupForm';
import authBg from '../../../assets/images/backgrounds/auth-bg.jpg';
import logoHeader from '../../../assets/images/logo.png';

export const SignupPage = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Blurred Background - Fixed */}
      <div
        className="fixed inset-0"
        style={{ backgroundImage: `url(${authBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}
      ></div>

      {/* Logo */}
      <div className="fixed top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-8 z-10">
        <img
          src={logoHeader}
          alt="Carlton Leisure - Worldwide Travel & Tours"
          className="h-8 sm:h-10 md:h-12 w-auto"
        />
      </div>

      {/* Centered Signup Card */}
      <div className="min-h-screen flex items-center justify-center px-4 py-16 pt-20 md:pt-24 relative z-10">
        <SignupForm />
      </div>
    </div>
  );
};