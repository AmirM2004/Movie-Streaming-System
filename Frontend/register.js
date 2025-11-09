document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageDiv = document.getElementById('message');
  const formData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
  };

  if (formData.password.length < 8) {
      messageDiv.textContent = 'رمز عبور باید حداقل 8 کاراکتر باشد';
      messageDiv.className = 'message error';
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
          messageDiv.textContent = 'ثبت نام با موفقیت انجام شد';
          messageDiv.className = 'message success';
          
          // ذخیره اطلاعات کاربر در localStorage
          localStorage.setItem('user', JSON.stringify(data));
          
          // هدایت به صفحه کاربر بعد از 1 ثانیه
          setTimeout(() => {
              window.location.href = 'user.html';
          }, 1000);
      } else {
          messageDiv.textContent = data.error || 'خطا در ثبت نام';
          messageDiv.className = 'message error';
      }
  } catch (error) {
      messageDiv.textContent = 'خطا در ارتباط با سرور';
      messageDiv.className = 'message error';
  }
});

// اعتبارسنجی پسورد حین تایپ
document.getElementById('password').addEventListener('input', function(e) {
  const messageDiv = document.getElementById('message');
  if (this.value.length > 0 && this.value.length < 8) {
      messageDiv.textContent = 'رمز عبور باید حداقل 8 کاراکتر باشد';
      messageDiv.className = 'message error';
  } else {
      messageDiv.style.display = 'none';
  }
});