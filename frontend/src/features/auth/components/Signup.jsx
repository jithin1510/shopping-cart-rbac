import {FormHelperText, Stack, TextField, Typography, Box, useTheme, useMediaQuery, Alert} from '@mui/material'
import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from "react-hook-form"
import { ecommerceOutlookAnimation } from '../../../assets'
import {useDispatch, useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser, signupAsync, selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'
import RoleSelection from './RoleSelection'

export const Signup = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectSignupStatus)
  const error = useSelector(selectSignupError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const {register, handleSubmit, reset, control, formState: { errors }} = useForm()
  const navigate = useNavigate()
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))
  const [selectedRole, setSelectedRole] = useState('customer')
  const [formSubmitted, setFormSubmitted] = useState(false)

  // handles user redirection
  useEffect(() => {
    if(loggedInUser && !loggedInUser?.isVerified){
      navigate("/verify-otp")
    }
    else if(loggedInUser){
      navigate("/")
    }
  },[loggedInUser, navigate])

  // handles signup error and toast them
  useEffect(() => {
    if(error && formSubmitted){
      console.error('Signup error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
      setFormSubmitted(false)
    }
  },[error, formSubmitted])

  useEffect(() => {
    if(status === 'fullfilled'){
      let message = "Welcome! Verify your email to start shopping on mern-ecommerce."
      if (selectedRole === 'vendor') {
        message = "Welcome! Verify your email and wait for admin approval to start selling."
      }
      toast.success(message)
      reset()
      setFormSubmitted(false)
    }
    return () => {
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  },[status, dispatch, reset, selectedRole])

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  // this function handles signup and dispatches the signup action with credentials that api requires
  const handleSignup = (data) => {
    try {
      const cred = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: selectedRole
      }
      console.log('Submitting registration data:', { ...cred, password: '********' })
      setFormSubmitted(true)
      dispatch(signupAsync(cred))
    } catch (err) {
      console.error('Error in form submission:', err)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <Stack width={'100vw'} height={'100vh'} flexDirection={'row'} sx={{overflowY:"auto"}}>
      {
        !is900 &&
        <Stack bgcolor={'black'} flex={1} justifyContent={'center'} >
          <Lottie animationData={ecommerceOutlookAnimation}/>
        </Stack>
      }

      <Stack flex={1} justifyContent={'center'} alignItems={'center'} py={4}>
        <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
          <Stack rowGap={'.4rem'}>
            <Typography variant='h2' sx={{wordBreak:"break-word"}} fontWeight={600}>Mern Shop</Typography>
            <Typography alignSelf={'flex-end'} color={'GrayText'} variant='body2'>- Shop Anything</Typography>
          </Stack>
        </Stack>

        <Stack mt={4} spacing={2} width={is480?"95vw":'28rem'} component={'form'} noValidate onSubmit={handleSubmit(handleSignup)}>
          {status === 'rejected' && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || 'Registration failed. Please try again.'}
            </Alert>
          )}
          
          <MotionConfig whileHover={{y:-5}}>
            <motion.div>
              <TextField 
                fullWidth 
                {...register("name", {
                  required: "Username is required"
                })} 
                placeholder='Username'
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField 
                fullWidth 
                type="text"
                {...register("email", {
                  required: "Email is required"
                })} 
                placeholder='Email'
              />
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField 
                type='password' 
                fullWidth 
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })} 
                placeholder='Password'
              />
              {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
            </motion.div>
            
            <motion.div>
              <TextField 
                type='password' 
                fullWidth 
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value, formValues) => value === formValues.password || "Passwords don't match"
                })} 
                placeholder='Confirm Password'
              />
              {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
            </motion.div>
          </MotionConfig>

          {/* Role Selection Component */}
          <Controller
            name="role"
            control={control}
            defaultValue={selectedRole}
            render={({ field }) => (
              <RoleSelection 
                selectedRole={selectedRole} 
                handleRoleChange={handleRoleChange} 
                {...field}
              />
            )}
          />

          {selectedRole === 'vendor' && (
            <Alert severity="info">
              Vendor accounts require admin approval before you can start selling products.
            </Alert>
          )}

          <motion.div whileHover={{scale:1.020}} whileTap={{scale:1}}>
            <LoadingButton sx={{height:'2.5rem'}} fullWidth loading={status==='pending'} type='submit' variant='contained'>Signup</LoadingButton>
          </motion.div>

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>
            <MotionConfig whileHover={{x:2}} whileTap={{scale:1.050}}>
              <motion.div>
                <Typography mr={'1.5rem'} sx={{textDecoration:"none",color:"text.primary"}} to={'/forgot-password'} component={Link}>Forgot password</Typography>
              </motion.div>

              <motion.div>
                <Typography sx={{textDecoration:"none",color:"text.primary"}} to={'/login'} component={Link}>Already a member? <span style={{color:theme.palette.primary.dark}}>Login</span></Typography>
              </motion.div>
            </MotionConfig>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}