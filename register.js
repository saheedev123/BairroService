document.addEventListener('DOMContentLoaded', function () {
  const accountType = document.getElementById('accountType')
  const professionSection = document.getElementById('professionSection')
  const businessSection = document.getElementById('businessSection')

  const profession = document.getElementById('profession')
  const businessName = document.getElementById('businessName')
  const businessCategory = document.getElementById('businessCategory')

  const registerForm = document.getElementById('registerForm')

  function updateRegistrationFields() {
    // Hide both sections first
    professionSection.style.display = 'none'
    businessSection.style.display = 'none'

    // Remove required fields from hidden sections
    profession.required = false
    businessName.required = false
    businessCategory.required = false

    // Show the correct section
    if (accountType.value === 'professional') {
      professionSection.style.display = 'block'
      profession.required = true
    } else if (accountType.value === 'business') {
      businessSection.style.display = 'block'
      businessName.required = true
      businessCategory.required = true
    }
  }

  // Update fields when account type changes
  accountType.addEventListener('change', updateRegistrationFields)

  // Also update fields when the page first opens
  updateRegistrationFields()

  // Handle form submission
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault()

    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    if (!accountType.value) {
      alert('Por favor, escolha o tipo de conta.')
      return
    }

    if (accountType.value === 'professional' && !profession.value) {
      alert('Por favor, escolha sua profissão.')
      return
    }

    if (
      accountType.value === 'business' &&
      (!businessName.value.trim() || !businessCategory.value)
    ) {
      alert('Por favor, preencha os dados do seu negócio.')
      return
    }

    const userProfile = {
      fullname: document.getElementById('fullname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      neighborhood: document.getElementById('neighborhood').value,
      accountType: accountType.value,
      profession: profession.value,
      businessName: businessName.value,
      businessCategory: businessCategory.value,
      businessDescription: document.getElementById('businessDescription').value,
    }

    sessionStorage.setItem('bairroUser', JSON.stringify(userProfile))

    alert('Cadastro validado com sucesso!')

    if (accountType.value === 'professional') {
      window.location.href = 'professional-dashboard.html'
    } else {
      window.location.href = 'business-dashboard.html'
    }
  })
})
