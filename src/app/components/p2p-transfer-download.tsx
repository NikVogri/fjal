"use client";

import { useEffect, useRef } from "react";
import Card from "./UI/Card";
import WebTorrent from "@/core/webtorrent";
import { useParams, useSearchParams } from "next/navigation";

export default function P2PTransferDownload({ magnetUri }: { magnetUri: string }) {
	const wt = useRef<any>();

	const params = useSearchParams();

	useEffect(() => {
		if (!params.get("magnet")) return;
		const decodedURI = atob(decodeURI(params.get("magnet")!));

		console.log(decodedURI);

		try {

			// TODO: remove trackers
			// TODO: if not possibe, are trackers aware of the file? if so, then this is not safe!

			// TODO: check if possible to not have same magnet url (seems that for different files it is different)
			// it might be that if the same client + filename then the magnet url is the same.

			// TODO: check if I can actually stream the file, instead of storing it in memory!
			wt.current = new WebTorrent({ dht: false });

			wt.current.add(decodedURI, (torrent) => {
				// Got torrent metadata!
				console.log("torrent info", torrent);
				console.log("Client is downloading:", torrent.infoHash);

				for (const file of torrent.files) {
					file.blob()
						.then((b) => {
							console.log(file);
							const anchor = document.createElement("a");
							anchor.href = URL.createObjectURL(b);
							anchor.setAttribute("download", file.name);
							document.body.appendChild(anchor);
							anchor.click();
							document.body.removeChild(anchor);
						})
						.catch((err) => console.log("error", err));
				}
			});
		} catch (error) {}
	}, []);

	return (
		<Card>
			<h1>hello</h1>
			<div className="data"></div>
		</Card>
	);
}
