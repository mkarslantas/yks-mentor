import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 mt-2">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Sorun devam ediyorsa{' '}
            <a 
              href="mailto:destek@yksmentor.com" 
              className="text-primary-600 hover:text-primary-500"
            >
              destek ekibimize
            </a>{' '}
            ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;