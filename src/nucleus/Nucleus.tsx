import React, { useState, useEffect } from 'react';
import './Nucleus.css';
import OmniverseLogo from './img/omniverse.ico';

interface ServerData {
    serverUrl: string;
    username: string;
    token: string;
}

const Nucleus: React.FC = () => {
    const [serverData, setServerData] = useState<ServerData>({
        serverUrl: 'omniverse://',
        username: '$omni-api-token',
        token: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ message: string; type: string } | null>(null);

    useEffect(() => {
        // Check if submit button should be disabled
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
            submitButton.disabled = !serverData.serverUrl || !serverData.username || !serverData.token;
        }
    }, [serverData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setServerData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAlertMessage(null);

        try {
            const response = await fetch((e.target as HTMLFormElement).action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serverData),
            });

            const data = await response.json();
            if (data.success) {
                setAlertMessage({
                    message: `Successfully added connection to ${data.serverName || serverData.serverUrl}.`,
                    type: 'success'
                });
            } else {
                setAlertMessage({
                    message: `There was an error attempting to connect to ${serverData.serverUrl}.`,
                    type: 'danger'
                });
            }
        } catch (ex) {
            console.error(ex);
            setAlertMessage({
                message: 'An unexpected error occurred.',
                type: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-center bg-dark form-signin w-100 m-auto" style={{ minHeight: '100vh' }}>
            <img src={OmniverseLogo} alt="Omniverse" className="mb-4" width="48" height="48" />
            <h1 className="h3 mb-2 fw-normal text-light">Add Nucleus Server</h1>
            <a href="https://docs.omniverse.nvidia.com/nucleus/latest/config-and-info/api_tokens.html"
                className="text-light" target="_blank" rel="noopener noreferrer">
                Generate Nucleus API tokens
            </a>
            <form onSubmit={handleSubmit} action="../authenticate">
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        id="floatingServer"
                        name="serverUrl"
                        placeholder="omniverse://"
                        value={serverData.serverUrl}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="floatingServer">Nucleus Server URL</label>
                </div>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        id="floatingUsername"
                        name="username"
                        placeholder="$omni-api-token"
                        value={serverData.username}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="floatingUsername">Username</label>
                </div>
                <div className="form-floating">
                    <input
                        type="password"
                        className="form-control"
                        id="floatingPassword"
                        name="token"
                        placeholder="password"
                        value={serverData.token}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="floatingPassword">API Token</label>
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    )}
                    {isSubmitting ? 'Adding server...' : 'Add server'}
                </button>
            </form>
            {alertMessage && (
                <div className={`alert alert-${alertMessage.type} mt-4 text-start`} role="alert">
                    <p className="mb-0" dangerouslySetInnerHTML={{ __html: alertMessage.message }}></p>
                </div>
            )}
        </div>
    );
};

export default Nucleus;