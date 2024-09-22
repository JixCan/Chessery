import React, { useEffect, useRef } from 'react';
import './Login.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const containerRef = useRef(null);

    useEffect(() => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signin');
        const container = containerRef.current;

        signUpButton.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });

        return () => {
            signUpButton.removeEventListener('click', () => {
                container.classList.add('right-panel-active');
            });
            signInButton.removeEventListener('click', () => {
                container.classList.remove('right-panel-active');
            });
        };
    }, []);

    /*useEffect(() => {
        // Проверяем, есть ли флаг успешной операции в localStorage
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage, { position: "bottom-right", autoClose: 3000 });
            localStorage.removeItem('successMessage'); // Удаляем флаг, чтобы сообщение не повторялось
        }
    }, []);*/

    const handleRegister = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('email', data.email);
                localStorage.setItem('rating', data.rating);
                localStorage.setItem('pgn', data.pgn);
                
                localStorage.setItem('successMessage', 'Успешная регистрация!'); // Устанавливаем флаг успешной регистрации
                window.location.reload(); // Перезагружаем страницу
            } else {
                toast.error(data.message, { position: "bottom-right", autoClose: 3000 });
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            toast.error('Ошибка сервера при регистрации', { position: "bottom-right", autoClose: 3000 });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('email', data.email);
                localStorage.setItem('rating', data.rating);
                localStorage.setItem('pgn', data.pgn);
                
                localStorage.setItem('successMessage', 'Успешный вход!'); // Устанавливаем флаг успешного входа
                window.location.reload(); // Перезагружаем страницу
            } else {
                toast.error(data.message, { position: "bottom-right", autoClose: 2000 });
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            toast.error('Ошибка сервера при входе', { position: "bottom-right", autoClose: 2000 });
        }
    };

    return (
        <div id="login-main">
            <ToastContainer />
            <div className="container" id="container" ref={containerRef}>
                {/* Регистрация */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegister}>
                        <h1>Создайте аккаунт</h1>
                        <span>и пользуйтесь нашим сайтом</span>
                        <input type="text" name="username" placeholder="Имя" required />
                        <input type="email" name="email" placeholder="Электронная почта" required />
                        <input type="password" name="password" placeholder="Пароль" required />
                        <button type="submit">Зарегистрироваться</button>
                    </form>
                </div>

                {/* Вход */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin}>
                        <h1>Войдите в аккаунт</h1>
                        <span>или создайте новый на панели справа</span>
                        <input type="text" name="username" placeholder="Имя пользователя" required />
                        <input type="password" name="password" placeholder="Пароль" required />
                        <a href="#">Забыли пароль?</a>
                        <button type="submit">Войти</button>
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Добро пожаловать!</h1>
                            <p>Нажмите кнопку ниже, чтобы войти в уже существующий аккаунт</p>
                            <button className="ghost" id="signin">Войти</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Добро пожаловать!</h1>
                            <p>Нажмите кнопку ниже, чтобы создать новый аккаунт</p>
                            <button className="ghost" id="signUp">Зарегистрироваться</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
