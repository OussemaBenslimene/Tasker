import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import { ReactComponent as IconLeftSignUp } from '~/assets/register/sign-up-left.svg'
import { ReactComponent as IconRightSignUp } from '~/assets/register/sign-up-right.svg'
import TextField from '@mui/material/TextField'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { registerUserAPI } from '~/apis'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  EMAIL_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useTheme } from '@mui/material/styles'
import { toast } from 'react-toastify'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { green, red } from '@mui/material/colors'
import { useState } from 'react'
import { IconButton, InputAdornment } from '@mui/material'
import { CancelOutlined } from '@mui/icons-material'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const navigate = useNavigate()
  const theme = useTheme()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const passwordValue = watch('password')
  const confirmPasswordValue = watch('password_confirmation')

  const passwordsMatch =
    (confirmPasswordValue || '').length > 0 &&
    confirmPasswordValue === (passwordValue || '')

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(
      registerUserAPI({ email, password }),
      {
        pending: 'Registering is in progress...'
      }
    ).then(user => {
      navigate(`/login?registeredEmail=${user.email}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(submitRegister)}>
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundImage: `linear-gradient(${theme.palette.background.default}, ${theme.palette.background.paper})`
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '40px 0px',
          gap: 0.5
        }}>
          <SvgIcon component={TrelloIcon} fontSize="large" inheritViewBox sx={{ color: theme.palette.primary.main }} />
          <Typography variant='span' sx={{ fontSize: '2rem', fontWeight: 'bold', color: theme.palette.text.primary }}>
            Tasker
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <SvgIcon
            component={IconLeftSignUp}
            inheritViewBox
            sx={{
              width: '30%',
              position: 'absolute',
              bottom: '5%',
              left: '5%',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              verticalAlign: 'middle',
              borderStyle: 'none',
              animation: 'slideInLeft 2s ease-out forwards',
              opacity: 0,
              '@keyframes slideInLeft': {
                '0%': { opacity: 0, transform: 'translateX(-100px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' }
              }
            }}
          />
          <SvgIcon
            component={IconRightSignUp}
            inheritViewBox
            sx={{
              width: '30%',
              position: 'absolute',
              bottom: '5%',
              right: '5%',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              verticalAlign: 'middle',
              borderStyle: 'none',
              animation: 'slideInRight 2s ease-out forwards',
              opacity: 0,
              '@keyframes slideInRight': {
                '0%': { opacity: 0, transform: 'translateX(100px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' }
              }
            }}
          />
          {/* Form Register */}
          <Box sx={{
            width: '350px',
            padding: '25px 40px',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxSizing: 'border-box',
            borderColor: theme.palette.divider,
            borderRadius: '8px',
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.background.paper,
            position: 'relative',
            zIndex: 1
            
          }}>

            <Typography
              variant='h6'
              sx={{
                marginTop: '20px',
                marginBottom: '25px',
                textAlign: 'center',
                color: theme.palette.text.primary
              }}>
              Sign up for your account
            </Typography>

            <Box>
              <TextField
                label="Enter Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="text"
                error={!!errors['email']}
                {...register('email', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: EMAIL_RULE,
                    message: EMAIL_RULE_MESSAGE
                  }
                })}
                sx={{ backgroundColor: theme.palette.background.default }}
              />
              <FieldErrorAlert errors={errors} fieldName={'email'} />
            </Box>

            <Box>
              <TextField
                label="Create Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                error={!!errors['password']}
                {...register('password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
                sx={{ backgroundColor: theme => theme.palette.background.default }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FieldErrorAlert errors={errors} fieldName="password" />
            </Box>

            <Box>
              <TextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors['password_confirmation']}
                {...register('password_confirmation', {
                  validate: (value) => {
                    if (value === passwordValue) return true
                    return 'Password Confirmation does not match!'
                  }
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {confirmPasswordValue && (
                        passwordsMatch ? (
                          <CheckCircleOutline sx={{ color: green[500], ml: 1 }} />
                        ) : (
                          <CancelOutlined sx={{ color: red[500], ml: 1 }} />
                        )
                      )}
                    </InputAdornment>
                  )
                }}
              />
              <FieldErrorAlert errors={errors} fieldName="password_confirmation" />
            </Box>

            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                mt: 2,
                mb: 2,
                fontWeight: 'bold',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                }
              }}
            >
              Sign Up
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'underline',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => (e.target.style.color = theme.palette.primary.dark)}
                  onMouseLeave={(e) => (e.target.style.color = theme.palette.primary.main)}
                >
                  Log in
                </Link>
              </Typography>
            </Box>

          </Box>

        </Box>

      </Box>
    </form>
  )
}

export default RegisterForm