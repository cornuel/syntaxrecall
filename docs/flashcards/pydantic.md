# Pydantic v2 Flashcards for SyntaxRecall

These flashcards are designed to be imported into the SyntaxRecall platform and are mapped to the FastAPI Backend Developer roadmap.

## Instructions for Import
Use the provided `import_cards.py` script to batch import these cards into your local or production database.

---

### Core Concepts

---
tags: ["lib:pydantic", "syntax:basemodel", "framework:fastapi"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Pydantic Models"
language: "python"
---

# Pydantic BaseModel Definition

## Code Snippet
```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str = 'John Doe'
    is_active: bool = True
```

## Explanation
The `BaseModel` is the primary way to define data schemas in Pydantic. It uses Python type hints to define fields. Pydantic handles validation, type coercion (e.g., string "1" to int 1), and provides methods for serialization.

---
tags: ["lib:pydantic", "syntax:basemodel", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Pydantic Models"
language: "python"
---

# Model Validation: model_validate

## Code Snippet
```python
external_data = {"id": "123", "name": "Alice"}
user = User.model_validate(external_data)

print(user.id) # 123 (int)
```

## Explanation
`model_validate()` (replacing V1's `parse_obj`) creates a model instance from a dictionary. It performs type coercion and raises `ValidationError` if the data is invalid.

---
tags: ["lib:pydantic", "syntax:basemodel", "concept:serialization"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Pydantic Models"
language: "python"
---

# JSON Validation: model_validate_json

## Code Snippet
```python
json_data = '{"id": 1, "name": "Bob"}'
user = User.model_validate_json(json_data)
```

## Explanation
`model_validate_json()` is a highly optimized method (implemented in Rust via `pydantic-core`) for parsing JSON strings directly into Pydantic models. It is significantly faster than parsing JSON to a dict and then validating.

---
tags: ["lib:pydantic", "syntax:field", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Pydantic Models"
language: "python"
---

# The Field Function

## Code Snippet
```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    price: float = Field(gt=0, description="The price must be positive")
    code: str = Field(min_length=3, max_length=10)
```

## Explanation
`Field()` allows adding metadata and validation constraints to model fields. Common arguments include `gt` (greater than), `lt`, `min_length`, `max_length`, `pattern` (regex), `alias`, and `description`.

---
tags: ["lib:pydantic", "concept:validation", "syntax:annotated"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Pydantic Models"
language: "python"
---

# Annotated Types

## Code Snippet
```python
from typing import Annotated
from pydantic import BaseModel, Field

# Reusable type
PositiveInt = Annotated[int, Field(gt=0)]

class Account(BaseModel):
    balance: PositiveInt
```

## Explanation
Using `Annotated` with `Field` is the preferred Pydantic v2 way to define reusable, validated types. It keeps the model definition clean and allows logic to be shared across multiple models.

---

### Validation & Validators

---
tags: ["lib:pydantic", "syntax:field-validator", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Field Validators"
language: "python"
---

# Field Validator (@field_validator)

## Code Snippet
```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    username: str

    @field_validator('username')
    @classmethod
    def username_must_be_alphanumeric(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError('must be alphanumeric')
        return v
```

## Explanation
`@field_validator` is used for custom validation of specific fields. In Pydantic v2, these must be `classmethod`s. They receive the value and should return it (or a modified version) or raise an exception.

---
tags: ["lib:pydantic", "syntax:model-validator", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Model Validators"
language: "python"
---

# Model Validator: mode='after'

## Code Snippet
```python
from pydantic import BaseModel, model_validator

class Rectangle(BaseModel):
    width: float
    height: float

    @model_validator(mode='after')
    def check_square(self) -> 'Rectangle':
        if self.width == self.height:
            print("It's a square!")
        return self
```

## Explanation
`mode='after'` validators run after individual fields are validated. They are instance methods and are ideal for cross-field validation where you need access to the fully populated model instance.

---
tags: ["lib:pydantic", "syntax:model-validator", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Model Validators"
language: "python"
---

# Model Validator: mode='before'

## Code Snippet
```python
from pydantic import BaseModel, model_validator

class User(BaseModel):
    name: str

    @model_validator(mode='before')
    @classmethod
    def parse_input(cls, data: any) -> any:
        if isinstance(data, str):
            return {"name": data}
        return data
```

## Explanation
`mode='before'` validators run before field validation. They receive the raw input (usually a dict) and are useful for transforming or "fixing" input data before Pydantic attempts to map it to fields.

---
tags: ["lib:pydantic", "syntax:field-validator", "concept:validation"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Field Validators"
language: "python"
---

# Validator Modes: 'wrap'

## Code Snippet
```python
from pydantic import BaseModel, field_validator, ValidatorFunctionWrapHandler

class Model(BaseModel):
    x: int

    @field_validator('x', mode='wrap')
    @classmethod
    def wrap_validator(cls, v: any, handler: ValidatorFunctionWrapHandler) -> int:
        # Code before Pydantic validation
        try:
            validated_value = handler(v)
        except Exception:
            return 0 # Fallback
        # Code after Pydantic validation
        return validated_value
```

## Explanation
`mode='wrap'` gives complete control. You receive a `handler` which represents the next validation step (Pydantic's internal logic or other validators). You can call it, catch its errors, or bypass it entirely.

---

### Configuration & Serialization

---
tags: ["lib:pydantic", "syntax:configdict", "concept:configuration"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Model Configuration"
language: "python"
---

# Model Configuration: ConfigDict

## Code Snippet
```python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra='forbid',
        strict=True
    )
    name: str
```

## Explanation
`ConfigDict` is the Pydantic v2 way to configure model behavior. Common options include `extra` ('allow', 'ignore', 'forbid'), `strict` (toggle type coercion), and `from_attributes` (formerly `orm_mode`).

---
tags: ["lib:pydantic", "syntax:basemodel", "concept:serialization"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "JSON Models & Filtering"
language: "python"
---

# Serialization: model_dump

## Code Snippet
```python
user = User(id=1, name="Alice")
data_dict = user.model_dump(
    include={"id"}, 
    exclude_unset=True
)
```

## Explanation
`model_dump()` converts a model instance to a dictionary. You can use `include`, `exclude`, `exclude_unset` (only fields explicitly set), `exclude_defaults`, and `exclude_none` to filter the output.

---
tags: ["lib:pydantic", "syntax:basemodel", "concept:serialization"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "JSON Models & Filtering"
language: "python"
---

# JSON Serialization: model_dump_json

## Code Snippet
```python
user = User(id=1, name="Alice")
json_str = user.model_dump_json(indent=2)
```

## Explanation
`model_dump_json()` serializes the model directly to a JSON string. It supports the same filtering arguments as `model_dump()`.

---

### Advanced Features

---
tags: ["lib:pydantic", "syntax:computed-field", "concept:advanced"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Advanced Pydantic"
language: "python"
---

# Computed Fields

## Code Snippet
```python
from pydantic import BaseModel, computed_field

class Box(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        return self.width * self.height
```

## Explanation
`@computed_field` allows properties to be included in the model's serialized output (both `model_dump()` and `model_dump_json()`).

---
tags: ["lib:pydantic", "syntax:type-adapter", "concept:advanced"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Advanced Pydantic"
language: "python"
---

# TypeAdapter

## Code Snippet
```python
from pydantic import TypeAdapter

ta = TypeAdapter(list[int])
ints = ta.validate_python(["1", "2", "3"])
# [1, 2, 3]
```

## Explanation
`TypeAdapter` allows using Pydantic's validation and serialization logic on types that aren't `BaseModel` subclasses, such as lists, dicts, or standard Python primitives.

---
tags: ["lib:pydantic", "syntax:generics", "concept:advanced"]
roadmap_id: "fastapi-backend-developer"
roadmap_title: "Advanced Pydantic"
language: "python"
---

# Generic Models

## Code Snippet
```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T')

class Response(BaseModel, Generic[T]):
    data: T
    error: str | None = None

# Usage
UserResponse = Response[User]
```

## Explanation
Pydantic fully supports Python generics. This is extremely useful for defining standard API response wrappers or other reusable generic structures while maintaining full type safety and validation for the inner type.

---
