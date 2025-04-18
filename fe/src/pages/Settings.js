import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaMountain, FaTrash, FaCamera } from 'react-icons/fa';
import {
  Home,
  MapPin,
  Star,
  Languages,
  Settings,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import profile from '../img/profile.png';
import { useTranslation } from 'react-i18next';
import '../i18n';
import axios from 'axios';

function SettingsPage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    setShowLanguageModal(false);
  };

  const [user, setUser] = useState({});
  const token = localStorage.getItem('token');
  const roles = JSON.parse(localStorage.getItem('roles'));

  const [activeMenu, setActiveMenu] = useState(t('setting:menu.profile'));
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setNameInput(response.data.name);
        setEmailInput(response.data.email);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    setActiveMenu(t('setting:menu.profile'));

    if (!token) {
      navigate('/login');
    } else {
      fetchUser();
    }
  }, [navigate, token, t]);

  const logoutHandler = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSidebarClick = (icon) => {
    switch (icon) {
      case 'Home':
        navigate('/');
        break;
      case 'MapPin':
        navigate('/destination');
        break;
      case 'Star':
        navigate('/rating');
        break;
      case 'Languages':
        setShowLanguageModal(true);
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'LogOut':
        logoutHandler();
        break;
      default:
        console.log(`${icon} clicked`);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    alert(t('setting:delete.success'));
  };

  const handleSaveProfile = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      alert(t('setting:alerts.invalid_email'));
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:8000/api/profile',
        { name: nameInput, email: emailInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t('setting:alerts.profile_saved'));
      setEditing(false);
      setUser(response.data.user);
    } catch (error) {
      alert(
        error.response?.status === 422
          ? error.response.data.message || t('setting:alerts.validation_failed')
          : t('setting:alerts.save_failed')
      );
      console.error(error);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError(t('setting:password.min_length'));
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:8000/api/password',
        { old_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(t('setting:password.success'));
        setCurrentPassword('');
        setNewPassword('');
        setEditing(false);
      } else {
        setPasswordError(
          response.data.message || t('setting:password.error.general')
        );
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data.errors || {};
          setPasswordError(
            errors.old_password?.[0] ||
              errors.new_password?.[0] ||
              t('setting:password.error.validation')
          );
        } else {
          setPasswordError(t('setting:password.error.server'));
        }
      } else {
        setPasswordError(t('setting:password.error.connection'));
      }
    }
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <div className='w-16 bg-teal-700 flex flex-col items-center justify-between py-6 text-black fixed h-full'>
        <div className='space-y-6 cursor-pointer'>
          <Home
            className='w-5 h-5'
            onClick={() => handleSidebarClick('Home')}
          />
          <MapPin
            className='w-5 h-5'
            onClick={() => handleSidebarClick('MapPin')}
          />
          <Star
            className='w-5 h-5'
            onClick={() => handleSidebarClick('Star')}
          />
          <Languages
            className='w-5 h-5'
            onClick={() => handleSidebarClick('Languages')}
          />
          <Settings
            className='w-5 h-5'
            onClick={() => handleSidebarClick('Settings')}
          />
        </div>
        <LogOut
          className='w-5 h-5 cursor-pointer'
          onClick={() => handleSidebarClick('LogOut')}
        />
      </div>

      {/* Main */}
      <div className='flex-1 bg-gray-100 overflow-auto ml-16'>
        {/* Topbar */}
        <div className='flex justify-between items-center p-4 bg-white shadow'>
          <div className='text-xl font-semibold text-blue-900'>NusaExplore</div>
          <div className='flex items-center gap-3 w-full max-w-xl relative'>
            <Input
              type='text'
              placeholder={t('search')}
              className='w-full pr-10'
            />
            <div className='absolute right-4 top-3 cursor-pointer'>
              <Search className='w-5 h-5 text-gray-500' />
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Bell className='w-5 h-5 text-gray-500' />
            <img src={profile} alt='User' className='w-8 h-8 rounded-full' />
            <div>
              <p className='font-medium text-sm lowercase'>
                {user.name || 'user'}
              </p>
              <p className='text-xs text-blue-600 cursor-pointer lowercase'>
                {roles || 'user'}
              </p>
            </div>
          </div>
        </div>

        <div className='flex h-full'>
          <div className='w-64 bg-[#D6F0F7] p-6 flex flex-col justify-between rounded-xl shadow-lg'>
            <div>
              <div className='flex items-center mb-10 text-xl font-bold text-blue-800'>
                <span className='text-2xl font-extrabold'>
                  {t('setting:menu.title')}
                </span>
              </div>
              <ul className='space-y-5'>
                {[
                  t('setting:menu.profile'),
                  t('setting:menu.change_password'),
                  t('setting:menu.become_manager'),
                  t('setting:menu.delete_account'),
                ].map((item) => (
                  <li
                    key={item}
                    className={`px-4 py-2 cursor-pointer flex items-center space-x-2 text-[#0B3E58] hover:font-semibold hover:bg-blue-100 rounded-xl ${
                      activeMenu === item ? 'font-bold' : ''
                    }`}
                    onClick={() => setActiveMenu(item)}
                  >
                    <span>
                      {item === t('setting:menu.profile') && <FaUser />}
                      {item === t('setting:menu.change_password') && <FaLock />}
                      {item === t('setting:menu.become_manager') && (
                        <FaMountain />
                      )}
                      {item === t('setting:menu.delete_account') && <FaTrash />}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='flex-1 p-10 overflow-y-auto'>
            {activeMenu === t('setting:menu.profile') && (
              <div className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
                <div className='flex items-center space-x-6'>
                  <div className='relative'>
                    <img
                      src={profile}
                      className='w-28 h-28 rounded-xl object-cover'
                    />
                    <div className='absolute bottom-0 right-0 bg-white p-1 rounded-full cursor-pointer'>
                      <FaCamera className='text-gray-600' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold'>
                      {user.name || 'user'}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {t('setting:profile.destination_manager')}
                    </p>
                  </div>
                  <button
                    className='ml-auto bg-blue-600 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl border'
                    onClick={() => setEditing(true)}
                  >
                    {t('setting:profile.edit_profile')}
                  </button>
                </div>

                <div className='space-y-4 max-w-xl'>
                  <div>
                    <label className='block text-gray-700'>
                      {t('setting:profile.username')}
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-2 rounded bg-gray-100'
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700'>
                      {t('setting:profile.email')}
                    </label>
                    <input
                      type='email'
                      className='w-full px-4 py-2 rounded bg-gray-100'
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  {editing && (
                    <div className='flex justify-end'>
                      <button
                        className='bg-blue-600 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl border'
                        onClick={handleSaveProfile}
                      >
                        {t('setting:profile.save_changes')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === t('setting:menu.change_password') && (
              <div className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
                <div className='flex items-center space-x-6'>
                  <div className='relative'>
                    <img
                      src={profile}
                      className='w-28 h-28 rounded-xl object-cover'
                    />
                    <div className='absolute bottom-0 right-0 bg-white p-1 rounded-full cursor-pointer'>
                      <FaCamera className='text-gray-600' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold'>
                      {user.name || 'user'}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {t('setting:profile.destination_manager')}
                    </p>
                  </div>
                  <button
                    className='ml-auto bg-blue-600 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl border'
                    onClick={() => setEditing(true)}
                  >
                    {t('setting:password.edit_password')}
                  </button>
                </div>

                <div className='space-y-4 max-w-xl'>
                  <div>
                    <label className='block text-gray-700'>
                      {t('setting:password.current')}
                    </label>
                    <input
                      type='password'
                      className='w-full px-4 py-2 rounded bg-gray-100'
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700'>
                      {t('setting:password.new')}
                    </label>
                    <input
                      type='password'
                      className='w-full px-4 py-2 rounded bg-gray-100'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  {passwordError && (
                    <p className='text-red-500 text-sm'>{passwordError}</p>
                  )}
                  {editing && (
                    <div className='flex justify-end'>
                      <button
                        className='bg-blue-600 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl border'
                        onClick={handleSavePassword}
                      >
                        {t('setting:profile.save_changes')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === t('setting:menu.become_manager') && (
              <div className='text-gray-700 text-lg'>
                <p>{t('setting:manager.info')}</p>
              </div>
            )}

            {activeMenu === t('setting:menu.delete_account') && (
              <div>
                <button
                  className='bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded'
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t('setting:delete.confirm')}
                </button>
              </div>
            )}

            {showDeleteConfirm && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white p-6 rounded-xl shadow-lg max-w-sm text-center space-y-4'>
                  <p className='text-lg font-semibold'>
                    {t('setting:delete.confirmation')}
                  </p>
                  <div className='flex justify-center space-x-4'>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className='px-4 py-2 rounded bg-gray-300'
                    >
                      {t('setting:delete.cancel')}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className='px-4 py-2 rounded bg-red-500 text-white'
                    >
                      {t('setting:delete.delete')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showLanguageModal && (
              <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
                <div className='bg-white rounded-lg p-6 w-80'>
                  <h2 className='text-lg font-semibold mb-4'>
                    {t('choose_language')}
                  </h2>
                  <div className='space-y-2'>
                    <button
                      onClick={() => changeLanguage('id')}
                      className='w-full text-left p-2 hover:bg-teal-100 rounded'
                    >
                      {t('indonesian')}
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className='w-full text-left p-2 hover:bg-teal-100 rounded'
                    >
                      {t('english')}
                    </button>
                  </div>
                  <div className='text-right mt-4'>
                    <button
                      onClick={() => setShowLanguageModal(false)}
                      className='text-sm text-red-500 hover:underline'
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
