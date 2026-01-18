// Отображение ошибки под невалидным полем
const showInputError = (formElement, inputElement, errorMessage, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  if (!errorElement) {
    console.warn(`Элемент ошибки не найден для: ${inputElement.id}`);
    return;
  }
  
  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
};

// Скрытие ошибки
const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  if (!errorElement) return;
  
  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(config.errorClass);
};

// Проверка валидности поля
const checkInputValidity = (formElement, inputElement, config) => {
  if (!inputElement.validity.valid) {
    if (inputElement.dataset.errorMessage && inputElement.validity.patternMismatch) {
      showInputError(formElement, inputElement, inputElement.dataset.errorMessage, config);
    } else {
      showInputError(formElement, inputElement, inputElement.validationMessage, config);
    }
  } else {
    hideInputError(formElement, inputElement, config);
  }
};

// Проверка наличия невалидных полей в форме
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

// Делает кнопку неактивной
const disableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.add(config.inactiveButtonClass);
  buttonElement.disabled = true;
};

// Делает кнопку активной
const enableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.remove(config.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Включение/отключение кнопки в зависимости от валидности полей
const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
};

// Установка слушателей событий для полей формы
const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  if (!buttonElement) {
    console.error(`Кнопка не найдена в форме: ${config.submitButtonSelector}`);
    return;
  }
  
  // Инициализируем состояние кнопки
  toggleButtonState(inputList, buttonElement, config);
  
  // Добавляем обработчики для каждого поля
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
    
    inputElement.addEventListener('blur', () => {
      checkInputValidity(formElement, inputElement, config);
    });
  });
  
  // Предотвращаем повторную инициализацию
  formElement.dataset.validationInitialized = 'true';
};

// Очистка ошибок валидации
export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  if (!buttonElement) return;
  
  // Скрываем все ошибки
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
    inputElement.setCustomValidity('');
  });
  
  // Делаем кнопку неактивной
  disableSubmitButton(buttonElement, config);
  
  // Сбрасываем форму
  formElement.reset();
};

// Включение валидации для всех форм
export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  
  formList.forEach((formElement) => {
    // Пропускаем уже инициализированные формы
    if (formElement.dataset.validationInitialized) {
      return;
    }
    
    setEventListeners(formElement, config);
  });
};