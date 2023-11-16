import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";

const Signup = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [pic, setPic] = useState();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchImage = async (data) => {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dtpnu1cmk/image/upload",
      {
        method: "post",
        body: data,
      }
    );
    const json = await response.json();
    setLoading(false);
    return json.url.toString();
  };
  const postDetails = async (pics) => {
    setLoading(true);

    if (pics === undefined) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 500,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (pics.type !== "image/jpeg") {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 500,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dtpnu1cmk");
    
    const imageURL = await fetchImage(data);
    setPic( imageURL);
    return;
  };
  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/user/register",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      console.log("data: " + data);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px" color="black">
      <FormControl id="name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <Input
          placeholder="Password"
          type={"password"}
          onChange={(e) => setPassword(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="confirmPassword" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <Input
          placeholder="Confirm Password"
          type={"password"}
          onChange={(e) => setConfirmPassword(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="pic" isRequired>
        <FormLabel>Up load your Pictures</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => {
            postDetails(e.target.files[0]);

          }}
        ></Input>
      </FormControl>
      <Button
        color="black"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={(e) => submitHandler()}
        backgroundColor="gray"
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
