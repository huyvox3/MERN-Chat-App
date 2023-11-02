import React, { useState } from "react";
import {
  Button,
  FormControl,
  Input,
  VStack,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toast } from "@chakra-ui/react";

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const toast = useToast();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
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

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
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
      setLoading(false);
    }
  };
  return (
    <VStack spacing="5px" color="black">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Password"
          type={"password"}
          onChange={(e) => setPassword(e.target.value)}
        ></Input>
      </FormControl>

      <Button
        color="black"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={(e) => submitHandler()}
        backgroundColor="gray"
      >
        Login
      </Button>
     
    </VStack>
  );
};

export default Login;
