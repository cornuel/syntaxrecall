from datetime import datetime, timedelta

def calculate_sm2(quality: int, repetitions: int, previous_interval: int, previous_ease_factor: float):
    """
    SM-2 Algorithm implementation.
    quality: 0-5
    repetitions: number of times this card has been successfully remembered
    previous_interval: previous interval in days
    previous_ease_factor: previous ease factor
    
    Returns: (new_repetitions, new_interval, new_ease_factor, next_review_date)
    """
    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(previous_interval * previous_ease_factor)
        
        new_repetitions = repetitions + 1
        new_ease_factor = previous_ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    else:
        new_repetitions = 0
        new_interval = 1
        new_ease_factor = previous_ease_factor
        
    if new_ease_factor < 1.3:
        new_ease_factor = 1.3
        
    next_review_date = datetime.now() + timedelta(days=new_interval)
    
    return new_repetitions, new_interval, new_ease_factor, next_review_date
