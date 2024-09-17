import React, { useEffect, useRef } from 'react';
import './Login.css';

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

    return (
        <div id="login-main">
            <div className="container" id="container" ref={containerRef}>
                <div className="form-container sign-up-container">
                    <form action="">
                        <h1>Создайте аккаунт</h1>
                        <span>или используйте вашу почту для регистрации</span>
                        <input type="text" placeholder="Имя" />
                        <input type="email" placeholder="Электронная почта" />
                        <input type="password" placeholder="Пароль" />
                        <button>Войти</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form action="">
                        <h1>Создать аккаунт</h1>
                        <span>или войти в уже существующий</span>
                        <input type="email" placeholder="Электронная почта" />
                        <input type="password" placeholder="Пароль" />
                        <a href="#">Забыли пароль?</a>
                        <button>Зарегистрироваться</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Добро пожаловать!</h1>
                            <p>Чтобы продолжить, введите свои данные для входа</p>
                            <button className="ghost" id="signin">Зарегистрироваться</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Добро пожаловать!</h1>
                            <p>Зарегистрируйтесь на сайте и продолжайте свою работу</p>
                            <button className="ghost" id="signUp">Войти</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
