import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import axios from "axios";
import fileDownload from "js-file-download";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "./config/ChatLogic";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const handleDownload = (url, filename) => {
    axios
      .get(url, {
        responseType: "blob",
      })
      .then((res) => {
        fileDownload(res.data, filename);
      });
  };
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            {m.type === "message" && (
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {m.content}
              </span>
            )}

            {m.type === "image" && (
              <Image
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  maxWidth: "12em",
                }}
                src={m.content}
              ></Image>
            )}
            {m.type === "video" && (
              <video
                controls
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  maxWidth: "18em",
                  maxHeight: "18em",
                }}
              >
                <source src={m.content} type="video/mp4"></source>
              </video>
            )}

            {m.type === "file" && (
              <span
                onClick={() =>{

                  handleDownload(m.content,m.fileName)}
                }
                style={{
                  cursor:'pointer',
                  // background: '../public/files.png',
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  textAlign: "right",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                <Image
                  width={"3em"}
                  mr={"1em"}
                  height={"3em"}
                  float={"left"}
                  src={
                    "http://res.cloudinary.com/dtpnu1cmk/raw/upload/v1699868810/qvvvpvgttfqaras6h5n7.png"
                  }
                ></Image>
                {m.fileName}
              </span>
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
