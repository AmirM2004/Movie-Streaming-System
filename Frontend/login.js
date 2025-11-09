
document.addEventListener('DOMContentLoaded', () => {
  // اگر کاربر قبلاً لاگین کرده بود، به صفحه مناسب هدایت شود
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user)
  if (user) {
      if (user.admin) {
          window.location.href = 'admin.html';
      } else {
          window.location.href = 'user.html';
      }
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageDiv = document.getElementById('message');
  const formData = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
  };

  try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
          messageDiv.textContent = 'ورود موفقیت‌آمیز';
          messageDiv.className = 'message success';
          
          // ذخیره اطلاعات کاربر
          localStorage.setItem('user', JSON.stringify(data));
          
          // هدایت به صفحه مناسب بعد از 1 ثانیه
          setTimeout(() => {
              if (data.admin) {
                  window.location.href = 'admin.html';
              } else {
                  window.location.href = 'user.html';
              }
          }, 1000);
      } else {
          messageDiv.textContent = data.error || 'نام کاربری یا رمز عبور اشتباه است';
          messageDiv.className = 'message error';
      }
  } catch (error) {
      messageDiv.textContent = 'خطا در ارتباط با سرور';
      messageDiv.className = 'message error';
  }
});