/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { 
  getUserInfo, 
  getCardList, 
  setUserInfo, 
  addNewCard,
  updateUserAvatar,
  deleteCardFromServer,
  changeLikeCardStatus
} from "./components/api.js";

import { createCardElement, deleteCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");

// Новое модальное окно статистики
const usersStatsModalWindow = document.querySelector(".popup_type_info");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logoButton = document.querySelector(".logo"); // Логотип для статистики

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

let currentUserId = '';
let cardToDelete = { element: null, id: null };

enableValidation(validationSettings);

// Функция форматирования даты
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Функция создания элемента статистики
const createInfoString = (term, description) => {
  const template = document.querySelector('#popup-info-definition-template').content;
  const infoItem = template.querySelector('.popup__info-item').cloneNode(true);
  
  const termElement = infoItem.querySelector('.popup__info-term');
  const descriptionElement = infoItem.querySelector('.popup__info-description');
  
  termElement.textContent = term;
  descriptionElement.textContent = description;
  
  return infoItem;
};

// Функция создания элемента пользователя
const createUserBadge = (userName) => {
  const template = document.querySelector('#popup-info-user-preview-template').content;
  const userBadge = template.querySelector('.popup__list-item').cloneNode(true);
  
  userBadge.textContent = userName;
  return userBadge;
};

// Обработчик клика на логотип
const handleLogoClick = () => {
  // Получаем актуальные данные с сервера
  getCardList()
    .then((cards) => {
      // Получаем элементы модального окна
      const modalTitle = usersStatsModalWindow.querySelector('.popup__title');
      const modalInfoList = usersStatsModalWindow.querySelector('.popup__info');
      const modalText = usersStatsModalWindow.querySelector('.popup__text');
      const modalUserList = usersStatsModalWindow.querySelector('.popup__list');
      
      // Очищаем предыдущие данные
      modalInfoList.innerHTML = '';
      modalUserList.innerHTML = '';
      
      // Устанавливаем заголовок
      modalTitle.textContent = `Статистика Пользователя`;
      
      // Рассчитываем статистику
      const totalCards = cards.length;
      const sortedCards = [...cards].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      // Собираем уникальных пользователей
      const usersMap = new Map();
      cards.forEach(card => {
        if (card.owner) {
          const userId = card.owner._id;
          const userName = card.owner.name;
          if (!usersMap.has(userId)) {
            usersMap.set(userId, { name: userName, count: 0 });
          }
          usersMap.get(userId).count++;
        }
      });
      
      // Создаем статистику
      modalInfoList.append(
        createInfoString("Всего мест:", totalCards.toString())
      );
      
      if (sortedCards.length > 0) {
        modalInfoList.append(
          createInfoString("Первая создана:", formatDate(new Date(sortedCards[0].createdAt)))
        );
        
        modalInfoList.append(
          createInfoString("Последняя создана:", formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt)))
        );
      }
      
      // Создаем список пользователей
      modalText.textContent = `Участники (${usersMap.size}):`;
      
      usersMap.forEach((userData, userId) => {
        const userBadge = createUserBadge(`${userData.name} (${userData.count})`);
        modalUserList.append(userBadge);
      });
      
      // Открываем модальное окно
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при загрузке статистики:', err);
    });
};

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cardsData]) => {
    currentUserId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cardsData.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
          userId: currentUserId
        })
      );
    });
  })
  .catch((err) => {
    console.log('Ошибка при загрузке данных:', err);
  });

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при обновлении профиля:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при обновлении аватара:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
          userId: currentUserId
        })
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при создании карточки:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = { element: cardElement, id: cardId };
  openModalWindow(removeCardModalWindow);
};

const handleConfirmDeleteCard = (evt) => {
  evt.preventDefault();
  
  if (cardToDelete.element && cardToDelete.id) {
    const submitButton = evt.target.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Удаление...';
    
    deleteCardFromServer(cardToDelete.id)
      .then(() => {
        deleteCard(cardToDelete.element);
        closeModalWindow(removeCardModalWindow);
        cardToDelete = { element: null, id: null };
      })
      .catch((err) => {
        console.log('Ошибка при удалении карточки:', err);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  }
};

const handleLikeCard = (evt, cardId, likeCountElement) => {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active');
      
      // Обновляем счетчик лайков
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes ? updatedCard.likes.length : 0;
      }
    })
    .catch((err) => {
      console.log('Ошибка при обновлении лайка:', err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Обработчик для логотипа
if (logoButton) {
  logoButton.addEventListener("click", handleLogoClick);
}

if (removeCardModalWindow) {
  const confirmDeleteForm = removeCardModalWindow.querySelector('.popup__form');
  if (confirmDeleteForm) {
    confirmDeleteForm.addEventListener('submit', handleConfirmDeleteCard);
  }
}

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});