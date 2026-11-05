from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import random

from .dictionary import START_DICT, CHECK_DICT

# Create your views here.
@csrf_exempt
def get_word(request):
    
    word = random.choice(list(START_DICT.keys()))

    print("returned ", word)
    return JsonResponse({"word": word, "syllables": START_DICT[word]})

@csrf_exempt
def check_word(request):
        #index 0 is initial word, index 2 is users input word
        data = json.loads(request.body)
        initial = data.get("initial_word", "").strip().lower()
        u_input = data.get("input_word", "").strip().lower()
        print(initial, u_input)

        if (u_input == ""):
            return JsonResponse({"message": "Word cannot be empty"})

        if u_input.lower() not in list(CHECK_DICT.keys()):
            print("Invalid Word")
            return JsonResponse({"message": "Invalid Word"})

        initial_syllables = CHECK_DICT[initial]
        user_syllables = CHECK_DICT[u_input]

        print(initial_syllables, user_syllables)

        points = len(initial_syllables[-1]) + len(user_syllables) #point per letter in syllable used, and point per syllable in users answer

        #if users entire word is just the last syllable, only 1 point
        if initial_syllables[-1].lower().strip() in list(CHECK_DICT.keys()):
            points = 1

        #if user word starts with last syllable
        if u_input.startswith(initial_syllables[-1]) == False:
            print("Syllables don't match, but word valid")
            return JsonResponse({"message": "-".join(initial_syllables)})
        
        print("Valid, points: ", points)
        return JsonResponse({"message": "Valid", "points": points})
