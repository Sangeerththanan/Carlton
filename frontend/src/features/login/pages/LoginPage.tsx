import { LoginForm } from '../components/LoginForm';
import authBg from '../../../assets/images/backgrounds/auth-bg.jpg';
import logoHeader from '../../../assets/images/logo_header.png';

export const LoginPage = () => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      {/* Logo */}
      <div className="absolute top-6 left-8">
        <img 
          src={logoHeader} 
          alt="Carlton Leisure - Worldwide Travel & Tours" 
          className="h-12 w-auto"
        />
      </div>

      {/* Centered Login Card */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoginForm />
      </div>
    </div>
  );
};
