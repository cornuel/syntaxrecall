from app.database import SessionLocal, engine
from app import models


def seed():
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Cleaning up existing data...")
        db.query(models.Like).delete()
        db.query(models.Card).delete()
        db.query(models.Deck).delete()
        db.query(models.User).delete()
        db.commit()

        print("Creating users...")
        users = [
            models.User(
                email="demo@example.com",
                username="demouser",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                github_id="1001",
            ),
            models.User(
                email="jane@example.com",
                username="janedoe",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
                github_id="1002",
            ),
            models.User(
                email="bob@example.com",
                username="bobsmith",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
                github_id="1003",
            ),
        ]

        db.add_all(users)
        db.commit()

        # Refresh to get IDs
        for u in users:
            db.refresh(u)

        demo, jane, bob = users[0], users[1], users[2]

        print("Creating Next.js Deck...")
        nextjs_deck = models.Deck(
            title="Next.js 14 Essentials",
            description="Deep dive into App Router, Server Actions, and SSR patterns.",
            is_public=True,
            owner_id=jane.id,
        )
        db.add(nextjs_deck)
        db.commit()
        db.refresh(nextjs_deck)

        nextjs_cards = [
            models.Card(
                deck_id=nextjs_deck.id,
                code_snippet="""// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data')
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}
 
export default async function Page() {
  const data = await getData()
  return <main>{/* ... */}</main>
}""",
                explanation="In Next.js App Router, all components are Server Components by default. You can fetch data directly in the component using async/await.",
                language="typescript",
                tags=["nextjs", "react", "server-components"],
            ),
            models.Card(
                deck_id=nextjs_deck.id,
                code_snippet="""'use client'
 
import { useState } from 'react'
 
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}""",
                explanation="To use state, effects, or event listeners, you must mark the component with 'use client' at the top of the file.",
                language="typescript",
                tags=["nextjs", "client-components", "hooks"],
            ),
            models.Card(
                deck_id=nextjs_deck.id,
                code_snippet="""import { revalidatePath } from 'next/cache'
 
export async function create(formData: FormData) {
  'use server'
  const id = await createItem(formData)
  revalidatePath('/items')
}""",
                explanation="Server Actions allow you to run backend code directly from components. 'use server' marks the function as a server action.",
                language="typescript",
                tags=["nextjs", "server-actions", "mutations"],
            ),
            models.Card(
                deck_id=nextjs_deck.id,
                code_snippet="""// app/api/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello World' })
}""",
                explanation="Route Handlers in App Router are defined in route.ts files and export async functions named after HTTP verbs (GET, POST, etc).",
                language="typescript",
                tags=["nextjs", "api", "routes"],
            ),
            models.Card(
                deck_id=nextjs_deck.id,
                code_snippet="""import { Image } from 'next/image'
 
export default function Avatar() {
  return <Image src="/me.png" alt="Me" width={64} height={64} />
}""",
                explanation="The Next.js Image component automatically optimizes images for performance, preventing layout shift and resizing on demand.",
                language="typescript",
                tags=["nextjs", "optimization", "image"],
            ),
        ]
        db.add_all(nextjs_cards)

        print("Creating Python Algorithms Deck...")
        algo_deck = models.Deck(
            title="Essential Python Algorithms",
            description="Common graph and sorting algorithms implemented in Python.",
            is_public=True,
            owner_id=bob.id,
        )
        db.add(algo_deck)
        db.commit()
        db.refresh(algo_deck)

        algo_cards = [
            models.Card(
                deck_id=algo_deck.id,
                code_snippet="""def bfs(graph, start):
    visited, queue = set(), [start]
    while queue:
        vertex = queue.pop(0)
        if vertex not in visited:
            visited.add(vertex)
            queue.extend(graph[vertex] - visited)
    return visited""",
                explanation="Breadth-First Search (BFS) explores the neighbor nodes first, before moving to the next level neighbors. It uses a Queue.",
                language="python",
                tags=["algorithms", "graph", "bfs"],
            ),
            models.Card(
                deck_id=algo_deck.id,
                code_snippet="""def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for next in graph[start] - visited:
        dfs(graph, next, visited)
    return visited""",
                explanation="Depth-First Search (DFS) explores as far as possible along each branch before backtracking. It uses recursion (stack).",
                language="python",
                tags=["algorithms", "graph", "dfs"],
            ),
            models.Card(
                deck_id=algo_deck.id,
                code_snippet="""def binary_search(arr, low, high, x):
    if high >= low:
        mid = (high + low) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binary_search(arr, low, mid - 1, x)
        else:
            return binary_search(arr, mid + 1, high, x)
    return -1""",
                explanation="Binary Search finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
                language="python",
                tags=["algorithms", "search", "binary-search"],
            ),
            models.Card(
                deck_id=algo_deck.id,
                code_snippet="""def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)""",
                explanation="Quicksort is a divide-and-conquer algorithm. It picks a pivot element and partitions the array around the pivot.",
                language="python",
                tags=["algorithms", "sorting", "recursion"],
            ),
            models.Card(
                deck_id=algo_deck.id,
                code_snippet="""def fibonacci(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]""",
                explanation="Fibonacci with Memoization (Dynamic Programming). Caching results of expensive function calls to avoid re-computation.",
                language="python",
                tags=["algorithms", "dp", "recursion"],
            ),
        ]
        db.add_all(algo_cards)

        print("Creating TypeScript Deck...")
        ts_deck = models.Deck(
            title="Advanced TypeScript Patterns",
            description="Master generics, utility types, and advanced inference.",
            is_public=True,
            owner_id=jane.id,
        )
        db.add(ts_deck)
        db.commit()
        db.refresh(ts_deck)

        ts_cards = [
            models.Card(
                deck_id=ts_deck.id,
                code_snippet="""type Partial<T> = {
  [P in keyof T]?: T[P];
};""",
                explanation="Mapped Types allow you to create new types based on old ones. Here, 'Partial' makes all properties of T optional.",
                language="typescript",
                tags=["typescript", "generics", "mapped-types"],
            ),
            models.Card(
                deck_id=ts_deck.id,
                code_snippet="""function identity<T>(arg: T): T {
  return arg;
}
// Usage
let output = identity<string>("myString");""",
                explanation="Generics provide variables to types. A function can enforce that the return type matches the argument type.",
                language="typescript",
                tags=["typescript", "generics", "functions"],
            ),
            models.Card(
                deck_id=ts_deck.id,
                code_snippet="""type Awaited<T> = T extends PromiseLike<infer U> ? U : T;""",
                explanation="Conditional Types with 'infer'. This unwrap a Promise to get the return type inside it.",
                language="typescript",
                tags=["typescript", "advanced", "conditional-types"],
            ),
            models.Card(
                deck_id=ts_deck.id,
                code_snippet="""interface User {
  id: number;
  name: string;
}
 
// Omit<T, K> constructs a type by picking all properties from T and then removing K
type UserPreview = Omit<User, "id">;""",
                explanation="Utility types like Pick and Omit help compose new types from existing interfaces without duplication.",
                language="typescript",
                tags=["typescript", "utility-types"],
            ),
            models.Card(
                deck_id=ts_deck.id,
                code_snippet="""const directions = ["North", "South", "East", "West"] as const;
type Direction = typeof directions[number];
// Direction is "North" | "South" | "East" | "West" """,
                explanation="Const assertions ('as const') make the compiler infer the most specific type possible (literal types) instead of general types like string[].",
                language="typescript",
                tags=["typescript", "const-assertions", "inference"],
            ),
        ]
        db.add_all(ts_cards)
        db.commit()

        print("Adding likes...")
        likes = [
            models.Like(user_id=bob.id, deck_id=nextjs_deck.id),
            models.Like(user_id=demo.id, deck_id=nextjs_deck.id),
            models.Like(user_id=jane.id, deck_id=algo_deck.id),
            models.Like(user_id=bob.id, deck_id=ts_deck.id),
        ]
        db.add_all(likes)
        db.commit()

        print("Seeding complete!")
        print(f"Users: {len(users)}")
        print(f"Decks: 3")
        print(f"Cards: {len(nextjs_cards) + len(algo_cards) + len(ts_cards)}")
        print(f"Likes: {len(likes)}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
