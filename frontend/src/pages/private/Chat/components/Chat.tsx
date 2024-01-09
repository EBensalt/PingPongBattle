import { ActionIcon } from "@mantine/core";
import { IconPingPong, IconSend2 } from "@tabler/icons-react";
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { DATA, MESSAGE } from "../myTypes";
import { setMessageData, setUserData } from "../utils";

interface Props {
	data: DATA,
	setData: React.Dispatch<React.SetStateAction<DATA>>
	avatar: string
}

const Chat: React.FC<Props> = ({ data, setData }) => {
	const	[conversation, setConversation] = useState<Array<{
		id: number,
		message: string,
		sender: string,
		avatar: string
	}>>([]);
	const	dataRef = useRef(data);
	dataRef.current = data;
	const	Reference = useRef<HTMLInputElement | null>(null);
	const	[trigger, setTrigger] = useState(false)

	useEffect(() => {
		if (Reference.current)
			Reference.current.focus();
	}, [data.talkingTo])
	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("http://localhost:3001/chathistory", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						sender: data.userData?.userName,
						recver: data.talkingTo
					})
				});
				const Data = await res.json()
				if (Data)
					setConversation(Data)
				else
					throw new Error("error")
			}
			catch {
				setConversation([]);
				return ;
			}
		}
		fetchData();
	}, [data])
	useEffect(() => {
		if (trigger) {
			// console.log({
			// 	sender: data.userData?.userName,
			// 	recver: data.talkingTo
			// })
			async function fetchData() {
				if (data.talkingTo) {
					const	res = await fetch("http://localhost:3001/chatUsers", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							sender: data.userData?.userName,
							recver: data.talkingTo,
						})
					});
					setData(prev => ({
						...prev,
						trigger: !prev.trigger
						// console.log("here1")
					}))
				}
				const res0 = await fetch("http://localhost:3001/chatUser", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							socket: data.socket?.id,
							username: data.userData?.userName
						})
					});
					const Data = await res0.json();
					setData(prev => setUserData(prev, Data));
					data.socket?.emit("newUser", data.talkingTo)
			}
			fetchData()
			setTrigger(false);
		}
	}, [trigger])
	function callBack(m: {
		id: number,
		message: string,
		sender: string,
		avatar: string,
	})
	{
		console.log("here")
		setData(x => ({
			...x,
			send: !x.send
		}))
		if (!dataRef.current.userData?.chatUsers.
			find(x => x.login == dataRef.current.talkingTo)) {
			setTrigger(true);
		}
		setConversation(prev => [m, ...prev]);
	}
	useEffect(() => {
		data.socket?.on("client", callBack);
		return (() => {
			data.socket?.off("newMessage", callBack);
		})
	}, [data.socket])
	function submit(event: FormEvent<HTMLFormElement>)
	{
		event.preventDefault();
		// console.log(data);
		const	Message: MESSAGE = {
			sender: data.userData ? data.userData.userName : "",
			recver: data.talkingTo ? data.talkingTo: "",
			message: data.message
		}
		data.socket?.emit("server", Message);
		setData(prev => setMessageData(prev, ""))
		if (Reference.current)
			Reference.current.focus();
	}
	function change(event: ChangeEvent<HTMLInputElement>)
	{
		setData(prev => setMessageData(prev, event.target.value))
	}
	return data.talkingTo && (
		<form
			onSubmit={submit}
			className="w-[57%] bg-discord4 flex flex-col
				justify-end text-discord6  p-0 rounded-e-3xl"
		>
			<ul className="max-h-90 overflow-auto flex flex-col-reverse">
				{conversation.map(x => {
					return (
						<li
							key={x.id}
							className="flex hover:bg-discord3
								rounded-md m-2 p-3"
						>
							<a
								href={`http://localhost:3000/public/profile?name=${x.sender}`}
							>
								<img
									src={x.avatar}
									className="h-12 w-12 rounded-full mr-3"
								/>
							</a>
							<div className="w-[80%]">
								<div className="font-extrabold">{x.sender}</div>
								<div className="break-words">{x.message}</div>
							</div>
						</li>)
				})}
			</ul>
			<div className="flex m-2">
				<input
					type="text"
					placeholder="Message..."
					className="bg-discord1 border-none outline-none w-full h-10 rounded-md mr-2 p-5"
					onChange={change}
					value={data.message}
					autoFocus
					ref={Reference}
				/>
				<button
					className="bg-discord1 w-10 h-10 rounded-md flex
						justify-center items-center"
					type="submit"
				>
					{ data.message.length ? <IconSend2 /> : <IconPingPong/>}
				</button>
			</div>
		</form>
	);
}
export default Chat;
