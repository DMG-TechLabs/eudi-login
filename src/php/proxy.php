<?php
class Record {
    public string $local;
    private string $remote;
    private bool $includeLocal;
    public bool $acceptChildren;

    public function __construct(string $local, string $remote, bool $acceptChildren, bool $includeLocal = false)
    {
        $this->local = $local;
        $this->remote = $remote;
        $this->acceptChildren = $acceptChildren;
        $this->includeLocal = $includeLocal;
    }

    public function getRemote(?string $requestedPath = null): string
    {
        if($requestedPath == null) {
            return $this->includeLocal ? rtrim($this->remote, '/') . $this->local : $this->remote;

        } else {
            return $this->includeLocal ? rtrim($this->remote, '/') . $requestedPath : $this->remote;
        }
    }
}

class Proxy {
    private array $table = [];

    public function set(Record $record): void
    {
        $local = rtrim($record->local, '/');
        $this->table[$local] = $record;
        $this->table[$local . '/'] = $record; // Ensure both versions are stored
    }

    public function get(string $local): ?string
    {
        $originalPath = $local;

        // Exact match
        if (isset($this->table[$local])) {
            return $this->table[$local]->getRemote();
        }

        // Traverse upwards to find an ancestor with acceptChildren = true
        $pathParts = explode('/', trim($local, '/'));
        while (!empty($pathParts)) {
            $currentPath = '/' . implode('/', $pathParts);

            if (isset($this->table[$currentPath]) && $this->table[$currentPath]->acceptChildren) {
                return $this->table[$currentPath]->getRemote($originalPath);
            }

            array_pop($pathParts);
        }

        return null;
    }
}
?>
