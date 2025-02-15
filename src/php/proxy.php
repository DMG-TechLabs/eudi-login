<?php 
class Record {
    public string $local;
    private string $remote;
    private bool $includeLocal;

    public function __construct(string $local, string $remote, bool $includeLocal = false)
    {
        $this->local = $local;
        $this->remote = $remote;
        $this->includeLocal = $includeLocal;
    }

    public function __get(string $remote): mixed
    {
        if($this->includeLocal) 
            return $this->remote . $this->local;

        return $this->remote;
    }
}

class Proxy {
    private array $table;

    public function set(Record $record): void
    {
        $local = $record->local;
        $this->table[$local] = $record;

        if (substr($local, -1) !== '/') {
            $this->table[$local . '/'] = $record;
        }
    }

    public function get(string $local): ?Record
    {
        return $this->table[$local] ?? null;
    }
}
?>
