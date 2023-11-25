import requests

url = "http://127.0.0.1:8000/predict"

# Sample data for the POST request
params = {
    "question": "What is enqueue ?",
    "context": '''Today, I'm going to teach you about queues. Queues are an elementary data structure that represents a dynamic set of data. 
    We insert and delete elements into a queue, but the delete operation is done in a predefined manner. For queues, this is called FIFO or First In, 
    First Out. We call the insert method in the queue and the delete method DQ. DQ takes no arguments. Let's look at an example. Here's what we use to 
    represent our queue. I've marked the front and the back. You'll see later in our Python example that we'll implement this with collections.deque, 
    which is a doubly linked list. This allows us to enqueue and dequeue in constant time. We'll insert elements at the back of the queue and remove 
    them from the front. We start with an empty queue and insert the element one; it's added at the back, but because the queue is empty, it's first 
    in line. Let's add a few more elements, two and three. Notice two and three are added at the back behind the element one. We dequeue our first 
    element, removing one, which was the first element added to the queue. Pretty simple. I'll let the rest of the example play without voiceover. 
    Lastly, let's look at the code, which is shown in Python and linked in the description. We'll use collections.deque as our queue and implement 
    the enqueue and DQ methods. For enqueue, we simply append the element to the end. For DQ, we call pop left, which removes the element at the 
    front of the queue because collections.deque is represented internally as a doubly linked list; this operation is achieved in constant time, 
    as is in queue. In computing, queues have numerous uses. Operating systems use them extensively for CPU and disk scheduling. When you swipe right 
    on a song in Spotify, you're adding it to a queue. And if you've watched my other videos, you've seen we've used queues to implement breadth-first 
    search. Thank you for watching; I hope this video helps you on your computer science journey. Please like and subscribe.'''
}

# Send the POST request with data as query parameters
response = requests.post(url, params=params)

# Check the response
if response.status_code == 200:
    result = response.json()
    print(f"Question: {result['question']}")
    print(f"Answer: {result['answer']}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
