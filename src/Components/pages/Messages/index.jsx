/** @format */

import React from 'react';
import styles from './Messages.module.css';
import { ContactsItem } from '../../ContactsItem';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { createChats, addMeMessage, addReceivingMessage } from '../../../redux/slice/chatsSlice';
import { UserChat } from '../../UserChat';
import { UserChatPlaceholder } from '../../UserChat/UserChatPlaceholder';

export const Messages = () => {
  const navigate = useNavigate();

  const [inputMessageValue, setInputMessageValue] = React.useState('');
  const [contactInput, setContactInput] = React.useState('');
  const [currentContact, setCurrentContact] = React.useState('');
  const [exitChat, setExitChat] = React.useState(false);
  const idInstance = useSelector((state) => state.loginSlice.idInstance);
  const apiTokenInstance = useSelector((state) => state.loginSlice.ApiTokenInstance);

  const contacts = useSelector((state) => ({...state.chatsSlice.chats}));

  const dispatch = useDispatch();

  const addNewContact = () => {
    dispatch(createChats(contactInput));
    setContactInput('');
  };

  const sendMessage = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/green_api/waInstance${idInstance}/SendMessage/${apiTokenInstance}`,
        {
          chatId: `${currentContact}@c.us`,
          message: `${inputMessageValue}`,
        },
      );
      dispatch(addMeMessage({ currentContact, inputMessageValue }));
      setInputMessageValue('');
      return response.data;
    } catch (e) {
      console.log(e);
    }
  };

  const confirmFetchingNewMessage = async (receiptId) => {
    try {
      await axios.delete(
        `http://localhost:3001/green_api/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${receiptId}`,
      );
    } catch (e) {
      console.log('Ошибка подтверждения получения сообщения', e);
    }
  };

  const fetchMessage = async () => {
    try {
      const response = await axios
        .get(
          `http://localhost:3001/green_api/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`,
        )
        .then((response) => response.data);
      return response;
    } catch (e) {
      console.log(`Error`, e);
      return e;
    }
  };

  const getMessages = async () => {
    if(exitChat) return;
    try {
      const data = await fetchMessage();
      if (!data) {
        getMessages();
      } 
      else if (data.body.messageData.typeMessage === 'textMessage') {
        dispatch(addReceivingMessage(data));
        await confirmFetchingNewMessage(data.receiptId);
        getMessages();
      } else {
        await confirmFetchingNewMessage(data.receiptId);
        getMessages();
      }
    } catch (e) {
      setTimeout(() => navigate('/'), 5000);
      console.log('error11', e);
    }
  };

  React.useEffect(() => {
    getMessages();
    return () => {
      setExitChat(true)
    }
  }, []);

  return (
    <div className={styles.messagesWrapper}>
      <div className={styles.chats}>
        <div className={styles.search}>
          <input
            type='text'
            placeholder='Добавить контакт'
            value={contactInput}
            onChange={(e) => setContactInput(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton} onClick={addNewContact}>
            Добавить
          </button>
        </div>
        <ContactsItem
          contacts={contacts}
          currentContact={currentContact}
          setCurrentContact={(name) => setCurrentContact(name)}
        />
      </div>

      {currentContact ? (
        <UserChat
          inputMessageValue={inputMessageValue}
          setInputMessageValue={setInputMessageValue}
          sendMessage={sendMessage}
          currentContact={currentContact}
        />
      ) : (
        <UserChatPlaceholder />
      )}
    </div>
  );
};
