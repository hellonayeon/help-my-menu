def get_api_key():
    file = open("keys.txt", "r")
    api_key = file.readline().split("=")[1]
    file.close()
    return api_key