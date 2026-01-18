export const createCardElement = (cardData, handlers) => {
    const cardTemplate = document.querySelector('#card-template').content;
    const cardElement = cardTemplate.querySelector('.places__item').cloneNode(true);
    
    const cardImage = cardElement.querySelector('.card__image');
    const cardTitle = cardElement.querySelector('.card__title');
    const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
    const likeButton = cardElement.querySelector('.card__like-button');
    const likeCountElement = cardElement.querySelector('.card__like-count');
    
    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    cardTitle.textContent = cardData.name;
    
    if (likeCountElement) {
      likeCountElement.textContent = cardData.likes ? cardData.likes.length : 0;
    }
    
    // Проверяем авторство - ПОКАЗЫВАЕМ ТОЛЬКО СВОИМ
    const isMyCard = cardData.owner && handlers.userId && cardData.owner._id === handlers.userId;
    
    if (isMyCard) {
      deleteButton.style.display = 'block';
      deleteButton.addEventListener('click', () => {
        if (handlers.onDeleteCard) {
          handlers.onDeleteCard(cardElement, cardData._id);
        }
      });
    } else {
      deleteButton.style.display = 'none';
    }
    
    // Проверяем лайки
    if (cardData.likes && handlers.userId) {
      const hasUserLike = cardData.likes.some(like => like._id === handlers.userId);
      if (hasUserLike) {
        likeButton.classList.add('card__like-button_is-active');
      }
    }
    
    cardImage.addEventListener('click', () => {
      if (handlers.onPreviewPicture) {
        handlers.onPreviewPicture(cardData);
      }
    });
    
    likeButton.addEventListener('click', (evt) => {
      if (handlers.onLikeIcon) {
        handlers.onLikeIcon(evt, cardData._id, likeCountElement);
      }
    });
    
    return cardElement;
  };
  
  export const deleteCard = (cardElement) => {
    if (cardElement && cardElement.parentNode) {
      cardElement.remove();
    }
  };