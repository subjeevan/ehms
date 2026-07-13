import { useMemo, useState } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import './LoginPage.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [values, setValues] = useState({
    username: '',
    password: '',
  })

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const errors = useMemo(
      () => ({
        username: !values.username.trim()
            ? 'Username is required.'
            : values.username.trim().length < 3
                ? 'Username must contain at least 3 characters.'
                : '',
        password: !values.password
            ? 'Password is required.'
            : values.password.length < 6
                ? 'Password must contain at least 6 characters.'
                : '',
      }),
      [values],
  )

  const isValid = !errors.username && !errors.password

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const markTouched = (field) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()

    setTouched({
      username: true,
      password: true,
    })

    setError('')

    if (!isValid || busy) {
      return
    }

    setBusy(true)

    try {
      await login({
        username: values.username.trim(),
        password: values.password,
      })

      const destination = location.state?.from?.pathname || '/dashboard'

      navigate(destination, {
        replace: true,
      })
    } catch (requestError) {
      console.error('Login error:', requestError)

      if (requestError?.status === 401) {
        setError('Invalid username or password.')
      } else if (requestError?.status === 403) {
        setError('Your account is not authorized to access the system.')
      } else {
        setError(
            requestError?.message ||
            'Unable to sign in. Please check the server connection.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
      <main className="login-page">
        <section className="login-introduction">
          <div className="login-introduction__content">
            <div className="login-brand">
              <div className="login-brand__logo" aria-hidden="true">
                H
              </div>

              <div>
                <strong>Vision HMS</strong>
                <span>Hospital Management System</span>
              </div>
            </div>

            <p className="login-introduction__eyebrow">
              Connected healthcare operations
            </p>

            <h1>One secure workspace for better hospital service.</h1>

            <p className="login-introduction__description">
              Manage patient registration, clinical records, departments,
              doctors, users, billing, and live operational summaries from one
              integrated platform.
            </p>

            <div className="login-feature-list">
              <div>
                <span aria-hidden="true">✓</span>
                Role-based access
              </div>

              <div>
                <span aria-hidden="true">✓</span>
                Live patient dashboard
              </div>

              <div>
                <span aria-hidden="true">✓</span>
                Secure clinical workflow
              </div>
            </div>
          </div>

          <div className="login-introduction__decoration login-introduction__decoration--one" />
          <div className="login-introduction__decoration login-introduction__decoration--two" />
        </section>

        <section className="login-form-section">
          <div className="login-card">
            <div className="login-mobile-brand">
              <div className="login-brand__logo" aria-hidden="true">
                H
              </div>

              <div>
                <strong>Vision HMS</strong>
                <span>Hospital Management</span>
              </div>
            </div>

            <div className="login-card__heading">
              <p>Welcome back</p>
              <h2>Sign in to HMS</h2>
              <span>Enter your authorized account credentials.</span>
            </div>

            {searchParams.get('expired') && (
                <Alert type="warning">
                  Your session expired. Please sign in again.
                </Alert>
            )}

            {error && (
                <Alert type="error" onClose={() => setError('')}>
                  {error}
                </Alert>
            )}

            <form className="login-form" onSubmit={submit} noValidate>
              <div className="login-field">
                <label htmlFor="username">Username</label>

                <div
                    className={`login-input-wrapper ${
                        touched.username && errors.username
                            ? 'login-input-wrapper--error'
                            : ''
                    }`}
                >
                <span className="login-input-icon" aria-hidden="true">
                  @
                </span>

                  <input
                      id="username"
                      name="username"
                      type="text"
                      value={values.username}
                      onChange={updateField}
                      onBlur={() => markTouched('username')}
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={busy}
                  />
                </div>

                {touched.username && errors.username && (
                    <small className="login-field__error">
                      {errors.username}
                    </small>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>

                <div
                    className={`login-input-wrapper ${
                        touched.password && errors.password
                            ? 'login-input-wrapper--error'
                            : ''
                    }`}
                >
                <span className="login-input-icon" aria-hidden="true">
                  ●
                </span>

                  <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={updateField}
                      onBlur={() => markTouched('password')}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={busy}
                  />

                  <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      disabled={busy}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {touched.password && errors.password && (
                    <small className="login-field__error">
                      {errors.password}
                    </small>
                )}
              </div>

              <button
                  type="submit"
                  className="login-submit-button"
                  disabled={busy}
              >
                {busy ? (
                    <>
                      <span className="login-button-spinner" />
                      Signing in...
                    </>
                ) : (
                    'Sign in securely'
                )}
              </button>
            </form>

            <div className="login-demo">
              <p>Demo accounts</p>

              <div>
              <span>
                Admin: <code>admin</code> / <code>Admin@123</code>
              </span>

                <span>
                User: <code>user</code> / <code>User@123</code>
              </span>
              </div>
            </div>

            <p className="login-footer">
              Authorized hospital personnel only
            </p>
          </div>
        </section>
      </main>
  )
}