import { ArrowBackIcon, ChevronRightIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Lottie from "react-lottie";
import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import animationData from "../animations/typingAnimation.json";
import ScrollableChat from "./ScrollableChat";
import VideoCall from "./VideoCall";
import { getSender, getSenderFull } from "./config/ChatLogic";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import "./style.css";
const ENDPOINT = "http://localhost:5000";

var socket, selectedChatCompare;
const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [file, setFile] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [fileType, setFileType] = useState("");
  const [isUpload, setIsUpload] = useState(false);
  const [messages, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    Chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
  }, [user]);

  useEffect(() => {
    fetchMessages();
    if (!selectedChat && selectedChatCompare)
      socket.emit("leave chat", selectedChatCompare._id, user._id);

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessage([...messages, newMessageReceived]);
      }
    });
    socket.on("my chat update", async (room) => {
      setChats([Chats, ...room]);
      setFetchAgain(!fetchAgain);
    });
  });

  const handleClick = (id) => {
    document.getElementById(id).click();
  };

  const typingHandler = (e) => {
    console.log(e.target.value);
    console.log(typing);
    if (e.key === "Backspace" || e.target.value === "") {
      socket.emit("stop typing");
      setTyping(false);
    }

    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    if (e.target.value !== "") {
      let lastTypingTime = new Date().getTime();
      var timerLength = 5000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;

        if (timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(`/messages/${selectedChat._id}`, config);

      setMessage(data);

      setLoading(false);
      socket.emit("join chat", selectedChat._id, user._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && (newMessage || fileLink)) {
      console.log(selectedChat._id);
      socket.emit("stop typing", selectedChat._id);
      socket.emit("fetch my chat", selectedChat._id);

      if (newMessage) {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          setNewMessage("");
          setFileLink("");
          const { data } = await axios.post(
            "/messages",
            {
              content: newMessage,
              type: "message",
              chatId: selectedChat._id,
              fileName: "message",
            },
            config
          );

          socket.emit("new message", data);
          setMessage([...messages, data]);
          console.log("message sent");
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }

      if (fileLink && fileType) {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.post(
            "/messages",
            {
              content: fileLink,
              type: fileType,
              chatId: selectedChat._id,
              fileName: file,
            },
            config
          );
          setFileLink("");
          setFileType("");

          socket.emit("new message", data);
          setMessage([...messages, data]);
          setFile("");
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    }
  };

  const sendMessageButton = async () => {
    if (newMessage || fileLink) {
      socket.emit("stop typing", selectedChat._id);
      socket.emit("fetch my chat", selectedChat._id);
      if (newMessage) {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          setNewMessage("");
          const { data } = await axios.post(
            "/messages",
            {
              content: newMessage,
              type: "message",
              chatId: selectedChat._id,
              fileName: "message",
            },
            config
          );

          socket.emit("new message", data);
          setMessage([...messages, data]);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    }

    if (fileLink && fileType) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "/messages",
          {
            content: fileLink,
            type: fileType,
            chatId: selectedChat._id,
            fileName: file,
          },
          config
        );
        setFileLink("");
        setFileType("");

        socket.emit("new message", data);
        setMessage([...messages, data]);
        setFile("");
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const fetchFile = async (data, type) => {
    var url = "https://api.cloudinary.com/v1_1/dtpnu1cmk/raw/upload";
    setFileType("file");
    if (type === "image") {
      url = "https://api.cloudinary.com/v1_1/dtpnu1cmk/image/upload";
      setFileType("image");
    }

    if (type === "video") {
      url = "https://api.cloudinary.com/v1_1/dtpnu1cmk/video/upload";
      setFileType("video");
    }

    const response = await fetch(url, {
      method: "post",
      body: data,
    });
    const json = await response.json();
    console.log(json.url.toString());
    setLoading(false);
    return json.url.toString();
  };
  const postDetails = async (pics) => {
    var type = "file";
    console.log(pics.type);
    if (pics === undefined) {
      toast({
        title: "Please select a file",
        status: "warning",
        duration: 500,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg") type = "image";
    if (pics.type === "video/mp4") type = "video";
    console.log(type);
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dtpnu1cmk");

    setIsUpload(true);
    const imageURL = await fetchFile(data, type);
    setFile(pics.name);
    setFileLink(imageURL);

    setIsUpload(false);
    return imageURL;
  };

  const openNewWindow = (selectedChat, user) => {
    let videoCallUrl = `videocall/${selectedChat._id}/${user._id}/true/${user.name}`;
    if (!selectedChat.isGroupChat)
      videoCallUrl = `videocall/${selectedChat._id}/${user._id}/false/${user.name}`;
    const container = document.createElement("div");
    ReactDOM.createPortal(<VideoCall></VideoCall>, container);
    const newWindow = window.open(
      videoCallUrl,
      "",
      "width=800,height=800,left=200,top=200"
    );
    newWindow.document.body.appendChild(container);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            // backgroundColor={"black"}
            fontFamily="Work Sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            textColor={"black"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon></ArrowBackIcon>}
              onClick={() => setSelectedChat("")}
            ></IconButton>

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                ></ProfileModal>
              </>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                ></UpdateGroupChatModal>
              </>
            )}

            <IconButton
              icon={<PhoneIcon></PhoneIcon>}
              onClick={() => {
                openNewWindow(selectedChat, user);
              }}
              color={"black"}
            ></IconButton>
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg={"#E8E8E8"}
            w="100%"
            h="100%"
            // backgroundColor={"black"}
            borderRadius="lg"
            overflowY="hidden"
            overflow={"scroll"}
            textColor={"black"}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              ></Spinner>
            ) : (
              <div className="messages" style={{ overflow: "scroll" }}>
                <ScrollableChat messages={messages}></ScrollableChat>
              </div>
            )}
            {isTyping ? (
              <>
                {}
                <Lottie
                  options={defaultOptions}
                  // display="flex"
                  height={"8em"}
                  width={"fit-content"}
                  style={{ marginLeft: 0 }}
                />
              </>
            ) : (
              <></>
            )}
            <FormControl
              className="form-control"
              display={"flex"}
              onKeyDown={sendMessage}
              isRequired
              mt={3}
            >
              <Input
                variant="filled"
                placeholder="Enter a message"
                onChange={typingHandler}
                bg={"#E0E0E0"}
                value={newMessage}
              ></Input>

              <IconButton
                display={"flex"}
                ml={2}
                onClick={sendMessageButton}
                color={"white"}
                backgroundColor={"gray"}
                icon={<ChevronRightIcon boxSize={"2em"}></ChevronRightIcon>}
              ></IconButton>
              <Button
                colorScheme="blue"
                ml={"3"}
                onClick={() => {
                  handleClick("upload");
                }}
              >
                Upload
              </Button>
              <Input
                type="file"
                id="upload"
                display={"none"}
                onChange={(e) => {
                  postDetails(e.target.files[0]);
                }}
              ></Input>
            </FormControl>
            {isUpload ? (
              <div>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="md"
                ></Spinner>
              </div>
            ) : (
              <>
                {file ? (
                  <Box>
                    <Text ml={"2"} float={"left"} display={"flex"}>
                      {file}
                    </Text>
                  </Box>
                ) : (
                  <></>
                )}
              </>
            )}
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          textColor="black"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work Sans">
            Click on a user to start Chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
