import re

def main():
    with open('backend/app/crud.py', 'r') as f:
        content = f.read()

    # Replace "db: Session" with "db: AsyncSession"
    content = content.replace('Session', 'AsyncSession')
    
    # Imports
    content = content.replace('from sqlalchemy.orm import AsyncSession', 'from sqlalchemy.ext.asyncio import AsyncSession')
    if 'from sqlalchemy.ext.asyncio import AsyncSession' not in content:
        content = content.replace('from sqlalchemy import select', 'from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession')

    # Add async to defs
    content = re.sub(r'^def ', 'async def ', content, flags=re.MULTILINE)

    # Replace awaitable db calls
    content = re.sub(r'db\.get\((.*?)\)', r'(await db.get(\1))', content)
    content = re.sub(r'db\.scalars\((.*?)\)', r'(await db.scalars(\1))', content)
    content = re.sub(r'db\.execute\((.*?)\)', r'(await db.execute(\1))', content)
    content = re.sub(r'db\.commit\(\)', r'await db.commit()', content)
    content = re.sub(r'db\.refresh\((.*?)\)', r'await db.refresh(\1)', content)

    # Some functions call other crud functions, need to await them
    content = re.sub(r'get_inspection\(db, (.*?)\)', r'await get_inspection(db, \1)', content)
    content = re.sub(r'log_inspection_edit\(', r'await log_inspection_edit(', content)

    # uuid.uuid4().hex etc are sync, so they are fine

    with open('backend/app/crud.py', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    main()
