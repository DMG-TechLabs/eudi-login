<?php
/**
 * Class Record
 * Represents a mapping between a local path and a remote target.
 */
class Record {
    /** @var string Local path */
    public string $local;

    /** @var string Remote target */
    private string $remote;

    /** @var bool Whether to include the local path in the remote target */
    private bool $includeLocal;

    /** @var bool Whether to accept child paths */
    public bool $acceptChildren;

    /**
     * Record constructor.
     *
     * @param string $local Local path
     * @param string $remote Remote target
     * @param bool $acceptChildren Allow child paths
     * @param bool $includeLocal Include local path in remote target (default: false)
     */
    public function __construct(string $local, string $remote, bool $acceptChildren, bool $includeLocal = false)
    {
        $this->local = $local;
        $this->remote = $remote;
        $this->acceptChildren = $acceptChildren;
        $this->includeLocal = $includeLocal;
    }

    /**
     * Get the remote target, optionally appending a requested path.
     *
     * @param string|null $requestedPath The requested path to append (optional)
     * @return string The resolved remote target
     */
    public function getRemote(?string $requestedPath = null): string
    {
        if ($requestedPath === null) {
            return $this->includeLocal ? rtrim($this->remote, '/') . $this->local : $this->remote;
        } else {
            return $this->includeLocal ? rtrim($this->remote, '/') . $requestedPath : $this->remote;
        }
    }
}

/**
 * Class Proxy
 * Manages a collection of Record mappings and resolves local paths to remote targets.
 */
class Proxy {
    /** @var array<string, Record> Mapping of local paths to Record objects */
    private array $table = [];

    /**
     * Add a Record to the proxy table.
     *
     * @param Record $record The record to add
     */
    public function set(Record $record): void
    {
        $local = rtrim($record->local, '/');
        $this->table[$local] = $record;
        $this->table[$local . '/'] = $record; // Ensure both versions are stored
    }

    /**
     * Load records from a JSON file and populate the proxy table.
     *
     * @param string $file Path to the JSON file
     * @throws RuntimeException If JSON decoding fails
     * @throws InvalidArgumentException If required fields are missing in a record
     */
    public function load(string $file): void
    {
        $jsonData = file_get_contents($file);
        $data = json_decode($jsonData, true);

        // Handle JSON errors
        if ($data === null) {
            throw new RuntimeException("Failed to decode JSON: " . json_last_error_msg());
        }

        foreach ($data as $key => $record) {
            if (!isset($record['target'], $record['allowChildren'], $record['includeLocal'])) {
                throw new InvalidArgumentException("Missing required fields in record: " . $key);
            }

            $target = $record['target'];
            $allowChildren = $record['allowChildren'];
            $includeLocal = $record['includeLocal'];

            $this->set(new Record($key, $target, $allowChildren, $includeLocal));
        }
    }

    /**
     * Get the remote target for a given local path.
     *
     * @param string $local The local path to resolve
     * @return string|null The corresponding remote target, or null if not found
     */
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
