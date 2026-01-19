from datetime import datetime, timedelta, timezone


def calculate_sm2(
    quality: int, repetitions: int, previous_interval: int, previous_ease_factor: float
):
    """
    SM-2 Algorithm implementation.
    Calculates the next review date and updated difficulty based on recall quality.

    Formula:
    EF' = max(1.3, EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

    Args:
        quality (int): 0-5 (0=forgot, 5=perfect recall)
        repetitions (int): number of times this card has been successfully remembered
        previous_interval (int): previous interval in days
        previous_ease_factor (float): previous ease factor (difficulty metric)

    Returns:
        tuple: (new_repetitions, new_interval, new_ease_factor, next_review_date)
    """
    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(previous_interval * previous_ease_factor)

        new_repetitions = repetitions + 1
        new_ease_factor = previous_ease_factor + (
            0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        )
    else:
        new_repetitions = 0
        new_interval = 1
        new_ease_factor = previous_ease_factor

    if new_ease_factor < 1.3:
        new_ease_factor = 1.3

    next_review_date = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return new_repetitions, new_interval, new_ease_factor, next_review_date
