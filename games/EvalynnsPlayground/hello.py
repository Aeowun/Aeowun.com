import time

name = None

limit = 5

def end_game():
    print("Goodbye")

    for _ in range(limit):
        print("😂 MASTER")
        time.sleep(0.5)


while True:
    name = input("What is your name? ")
    print("Hello,", name)

    if name.lower() == "sauce":
        print("Goodbye, mic saucy")
        break

    if name.lower() == "zack":
        print("Oh master, my master / WHAT HAVE I DONE 😂")
        end_game()