import LoginForm from '@/app/(auth)/login/LoginForm'

const LoginPage = () => {
  return (
    <div className='flex justify-center items-center min-h-screen p-4 text-base-content opacity-90'>
      <div className='card w-full max-w-sm bg-base-100/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl'>
        <div className='card-body'>
          <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
          <LoginForm />
          <div className="text-center mt-6">
            <p className="text-sm">Don't have an account? Contact your admin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage