// Отображение ошибки под невалидным полем
const showInputError = (formElement, inputElement, errorMessage, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
};

// Скрытие ошибки
const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(config.errorClass);
};

// Проверка валидности поля
const checkInputValidity = (formElement, inputElement, config) => {
  if (!inputElement.validity.valid) {
    // Для поля с data-error-message и ошибкой patternMismatch показываем кастомное сообщение
    if (inputElement.dataset.errorMessage && inputElement.validity.patternMismatch) {
      showInputError(formElement, inputElement, inputElement.dataset.errorMessage, config);
    } else {
      // Иначе показываем стандартное сообщение браузера
      showInputError(formElement, inputElement, inputElement.validationMessage, config);
    }
  } else {
    hideInputError(formElement, inputElement, config);
  }
};

// Проверка наличия невалидных полей в форме
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
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
  
  // При загрузке формы делаем кнопку неактивной
  disableSubmitButton(buttonElement, config);
  
  // Добавляем обработчики для каждого поля
  inputList.forEach((inputElement) => {
    // Обработчик ввода
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
    
    // Обработчик blur для немедленной валидации при уходе с поля
    inputElement.addEventListener('blur', () => {
      checkInputValidity(formElement, inputElement, config);
    });
  });
};

// Очистка ошибок валидации
export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  // Скрываем все ошибки
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
    // Сбрасываем состояние валидации браузера
    inputElement.setCustomValidity('');
  });
  
  // Делаем кнопку неактивной
  disableSubmitButton(buttonElement, config);
};

// Включение валидации для всех форм
export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  
  formList.forEach((formElement) => {
    // Устанавливаем обработчики для полей формы
    setEventListeners(formElement, config);
  });
};