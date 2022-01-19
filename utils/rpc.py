from pypresence import Presence
from time import time, sleep


rpc = Presence("931282939034103859")
try:
    print("connection established")
    rpc.connect()
    start = int(time())
    rpc.update(
        state="Single ready to mingle", 
        details="looking for a fish to love", 
        large_image="red-flags-logo", 
        small_image="red_flag", 
        large_text="boom", 
        small_text="Still single, baby", 
        party_size=[1,5],
        buttons=[{"label": "hot singles in your area", "url":"https://node-red-flags.herokuapp.com/"}], 
        party_id="ae488379-351d-4a4f-ad32-2b9b01c91657",
        start=start
        #join="https://node-red-flags.herokuapp.com/"
    )
except Exception as e:
    print(e)
while True:
    sleep(1)
