import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const saveToLocalStorage = (key: string, value: object) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const Register: React.FC = () => {
  const navigate = useNavigate(); // Навигация с помощью React Router

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormInputs) => {
    console.log('Register Data:', data);
    saveToLocalStorage('user', data);
    alert('Registration successful!');
    navigate('/dashboard'); // Перенаправление на Dashboard

  };

  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className="form-input"
          />
          {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className="form-input"
          />
          {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="form-input"
          />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="form-input"
          />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
